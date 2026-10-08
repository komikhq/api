import { createDbClient, comics, comicGenres, genres, creators, comicCreators } from "@/db";
import { desc, inArray, eq } from "drizzle-orm";
import type { AppEnv } from "@/middleware/auth";
import { queryAnalyticsEngine } from "@/utils/analytics-engine";

interface ComicRankingItem {
  comicId: string;
  views: number;
}

async function enrichRankedComics(
  databaseUrl: string,
  rankedList: { comicId: string; views: number }[]
) {
  if (rankedList.length === 0) return [];

  const db = createDbClient(databaseUrl);
  const comicIds = rankedList.map((r) => r.comicId);
  const periodViewCounts = new Map(rankedList.map((r) => [r.comicId, Number(r.views)]));

  const comicList = await db
    .select()
    .from(comics)
    .where(inArray(comics.id, comicIds));

  const comicMap = new Map(comicList.map((c) => [c.id, c]));
  const sortedComics = comicIds
    .map((id) => comicMap.get(id))
    .filter((c): c is typeof comics.$inferSelect => Boolean(c));

  const fetchedIds = sortedComics.map((c) => c.id);
  const comicGenresMap: Record<string, { id: string; name: string; slug: string }[]> = {};
  const comicCreatorsMap: Record<string, string[]> = {};

  if (fetchedIds.length > 0) {
    const cgList = await db
      .select({
        comicId: comicGenres.comicId,
        genreId: genres.id,
        genreName: genres.name,
        genreSlug: genres.slug,
      })
      .from(comicGenres)
      .innerJoin(genres, eq(comicGenres.genreId, genres.id))
      .where(inArray(comicGenres.comicId, fetchedIds));

    for (const item of cgList) {
      if (!comicGenresMap[item.comicId]) comicGenresMap[item.comicId] = [];
      comicGenresMap[item.comicId].push({
        id: item.genreId,
        name: item.genreName,
        slug: item.genreSlug,
      });
    }

    const ccList = await db
      .select({ comicId: comicCreators.comicId, creatorName: creators.name })
      .from(comicCreators)
      .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
      .where(inArray(comicCreators.comicId, fetchedIds));

    for (const item of ccList) {
      if (!comicCreatorsMap[item.comicId]) comicCreatorsMap[item.comicId] = [];
      comicCreatorsMap[item.comicId].push(item.creatorName);
    }
  }

  return sortedComics.map((item) => ({
    ...item,
    periodViews: periodViewCounts.get(item.id) ?? 0,
    genres: comicGenresMap[item.id] || [],
    creators: comicCreatorsMap[item.id] || [],
  }));
}

export async function refreshRankings(env: AppEnv["Bindings"]): Promise<{
  dailyCount: number;
  weeklyCount: number;
  popularCount: number;
}> {
  if (!env.DATABASE_URL) {
    return { dailyCount: 0, weeklyCount: 0, popularCount: 0 };
  }

  let dailyRanked: ComicRankingItem[] = [];
  let weeklyRanked: ComicRankingItem[] = [];

  try {
    // 1. Query Top 50 Daily from Analytics Engine
    const dailyResult = await queryAnalyticsEngine<ComicRankingItem>(
      env,
      `SELECT blob1 AS comicId, toUInt64(SUM(_sample_interval)) AS views
       FROM komikhq_views
       WHERE timestamp >= NOW() - INTERVAL '1' DAY
       GROUP BY comicId
       ORDER BY views DESC
       LIMIT 50`
    );
    dailyRanked = dailyResult.data;
  } catch (err) {
    console.error("[Refresh Rankings] Failed to fetch daily views from AE:", err);
  }

  try {
    // 2. Query Top 50 Weekly from Analytics Engine
    const weeklyResult = await queryAnalyticsEngine<ComicRankingItem>(
      env,
      `SELECT blob1 AS comicId, toUInt64(SUM(_sample_interval)) AS views
       FROM komikhq_views
       WHERE timestamp >= NOW() - INTERVAL '7' DAY
       GROUP BY comicId
       ORDER BY views DESC
       LIMIT 50`
    );
    weeklyRanked = weeklyResult.data;
  } catch (err) {
    console.error("[Refresh Rankings] Failed to fetch weekly views from AE:", err);
  }

  // 3. Query Popular All-Time from Database
  const db = createDbClient(env.DATABASE_URL);
  const popularComics = await db
    .select({ id: comics.id, totalViews: comics.totalViews })
    .from(comics)
    .orderBy(desc(comics.totalViews), desc(comics.createdAt))
    .limit(50);

  const popularRanked = popularComics.map((c) => ({
    comicId: c.id,
    views: c.totalViews,
  }));

  // 4. Enrich and cache in KV
  const [enrichedDaily, enrichedWeekly, enrichedPopular] = await Promise.all([
    enrichRankedComics(env.DATABASE_URL, dailyRanked),
    enrichRankedComics(env.DATABASE_URL, weeklyRanked),
    enrichRankedComics(env.DATABASE_URL, popularRanked),
  ]);

  if (enrichedDaily.length > 0) {
    await env.KV_KOMIKHQ.put("ranking:trending_daily", JSON.stringify(enrichedDaily));
  }
  if (enrichedWeekly.length > 0) {
    await env.KV_KOMIKHQ.put("ranking:trending_weekly", JSON.stringify(enrichedWeekly));
  }
  if (enrichedPopular.length > 0) {
    await env.KV_KOMIKHQ.put("ranking:popular_all_time", JSON.stringify(enrichedPopular));
  }

  return {
    dailyCount: enrichedDaily.length,
    weeklyCount: enrichedWeekly.length,
    popularCount: enrichedPopular.length,
  };
}
