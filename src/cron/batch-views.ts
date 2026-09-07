import { createDbClient, comics, comicViewLogs } from "../db";
import { sql } from "drizzle-orm";
import type { AppEnv } from "../middleware/auth";

export async function processBatchViews(env: AppEnv["Bindings"]) {
  if (!env.DATABASE_URL) return;

  const db = createDbClient(env.DATABASE_URL);

  // 1. Process timestamped view log entries (view_log:*)
  const listResult = await env.KV_KOMIKHQ.list({ prefix: "view_log:" });

  if (listResult.keys.length > 0) {
    const logsToInsert: {
      comicId: string;
      chapterId: string;
      userId: string | null;
      viewedAt: Date;
    }[] = [];

    const comicCountsMap: Record<string, number> = {};
    const keysToDelete: string[] = [];

    for (const keyObj of listResult.keys) {
      const key = keyObj.name;
      const rawPayload = await env.KV_KOMIKHQ.get(key);
      if (!rawPayload) {
        keysToDelete.push(key);
        continue;
      }

      try {
        const payload = JSON.parse(rawPayload);
        if (payload.comicId && payload.chapterId) {
          logsToInsert.push({
            comicId: payload.comicId,
            chapterId: payload.chapterId,
            userId: payload.userId || null,
            viewedAt: payload.viewedAt ? new Date(payload.viewedAt) : new Date(),
          });

          comicCountsMap[payload.comicId] = (comicCountsMap[payload.comicId] || 0) + 1;
        }
      } catch (e) {
        console.error(`[Cron Batch Views] Failed to parse view log payload for key ${key}:`, e);
      }

      keysToDelete.push(key);
    }

    // Bulk insert log events into comic_view_logs
    if (logsToInsert.length > 0) {
      // Execute in chunks of 500 to avoid query size limits
      const CHUNK_SIZE = 500;
      for (let i = 0; i < logsToInsert.length; i += CHUNK_SIZE) {
        const chunk = logsToInsert.slice(i, i + CHUNK_SIZE);
        await db.insert(comicViewLogs).values(chunk);
      }
    }

    // Update totalViews for comics
    for (const [comicId, viewsToAdd] of Object.entries(comicCountsMap)) {
      await db
        .update(comics)
        .set({ totalViews: sql`${comics.totalViews} + ${viewsToAdd}` })
        .where(sql`${comics.id} = ${comicId}`);
    }

    // Cleanup KV buffer keys
    for (const key of keysToDelete) {
      await env.KV_KOMIKHQ.delete(key);
    }
  }

  // 2. Backward compatibility fallback for legacy view:* KV keys
  const legacyListResult = await env.KV_KOMIKHQ.list({ prefix: "view:" });
  if (legacyListResult.keys.length > 0) {
    for (const keyObj of legacyListResult.keys) {
      const key = keyObj.name;
      const parts = key.split(":");
      if (parts.length >= 3) {
        const comicId = parts[1];
        const viewsCountStr = await env.KV_KOMIKHQ.get(key);
        const viewsToAdd = parseInt(viewsCountStr || "0", 10);

        if (viewsToAdd > 0) {
          await db
            .update(comics)
            .set({ totalViews: sql`${comics.totalViews} + ${viewsToAdd}` })
            .where(sql`${comics.id} = ${comicId}`);
        }
      }
      await env.KV_KOMIKHQ.delete(key);
    }
  }
}

