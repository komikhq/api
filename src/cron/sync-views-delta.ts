import { createDbClient, chapters, comics } from "@/db";
import { sql, and, eq } from "drizzle-orm";
import type { AppEnv } from "@/middleware/auth";
import { queryAnalyticsEngine } from "@/utils/analytics-engine";

interface ChapterViewDelta {
  comicId: string;
  chapterId: string;
  newViews: number;
}

export async function syncViewsDelta(env: AppEnv["Bindings"]): Promise<{
  syncedChapters: number;
  syncedComics: number;
  totalViewsAdded: number;
}> {
  if (!env.DATABASE_URL) {
    return { syncedChapters: 0, syncedComics: 0, totalViewsAdded: 0 };
  }

  const KV_SYNC_KEY = "views_sync:last_synced_at";
  const lastSyncedAt =
    (await env.KV_KOMIKHQ.get(KV_SYNC_KEY)) ||
    new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date().toISOString();

  let deltas: ChapterViewDelta[] = [];
  try {
    const result = await queryAnalyticsEngine<ChapterViewDelta>(
      env,
      `SELECT 
         blob1 AS comicId, 
         blob2 AS chapterId, 
         toUInt64(SUM(_sample_interval)) AS newViews
       FROM komikhq_views
       WHERE timestamp >= toDateTime64('${lastSyncedAt}', 3) 
         AND timestamp < toDateTime64('${nowIso}', 3)
       GROUP BY comicId, chapterId`
    );
    deltas = result.data;
  } catch (err) {
    console.error("[Sync Views Delta] Failed to query deltas from AE:", err);
    return { syncedChapters: 0, syncedComics: 0, totalViewsAdded: 0 };
  }

  if (deltas.length === 0) {
    await env.KV_KOMIKHQ.put(KV_SYNC_KEY, nowIso);
    return { syncedChapters: 0, syncedComics: 0, totalViewsAdded: 0 };
  }

  const db = createDbClient(env.DATABASE_URL);
  const comicTotalDeltas: Record<string, number> = {};
  let totalViewsAdded = 0;

  // 1. Update views on each Chapter WHERE id = chapter_id AND comic_id = comic_id
  for (const delta of deltas) {
    const viewsCount = Number(delta.newViews);
    if (!delta.chapterId || !delta.comicId || viewsCount <= 0) continue;

    await db
      .update(chapters)
      .set({ totalViews: sql`${chapters.totalViews} + ${viewsCount}` })
      .where(and(eq(chapters.id, delta.chapterId), eq(chapters.comicId, delta.comicId)));

    comicTotalDeltas[delta.comicId] = (comicTotalDeltas[delta.comicId] || 0) + viewsCount;
    totalViewsAdded += viewsCount;
  }

  // 2. Accumulate sum of chapter deltas to Comic totalViews
  for (const [comicId, viewsToAdd] of Object.entries(comicTotalDeltas)) {
    await db
      .update(comics)
      .set({ totalViews: sql`${comics.totalViews} + ${viewsToAdd}` })
      .where(eq(comics.id, comicId));
  }

  // 3. Mark last synced timestamp in KV
  await env.KV_KOMIKHQ.put(KV_SYNC_KEY, nowIso);

  return {
    syncedChapters: deltas.length,
    syncedComics: Object.keys(comicTotalDeltas).length,
    totalViewsAdded,
  };
}
