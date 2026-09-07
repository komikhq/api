import { createDbClient, comics, comicGenres, genres, creators, comicCreators, chapters, comicViewLogs } from "@/db";
import type { DbClient } from "@/db";
import { eq, like, or, and, count, desc, asc, inArray, notInArray, gte } from "drizzle-orm";

export interface ListComicsParams {
  q?: string;
  genre?: string;
  status?: string;
  type?: string;
  sort?: string;
  page: number;
  limit: number;
}

export class ComicRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findManyWithPagination(params: ListComicsParams) {
    const { q, genre, status, type, sort, page, limit } = params;
    const offset = (page - 1) * limit;

    let genreComicIds: string[] | null = null;
    if (genre && genre !== "all") {
      const matched = await this.db
        .select({ comicId: comicGenres.comicId })
        .from(comicGenres)
        .innerJoin(genres, eq(comicGenres.genreId, genres.id))
        .where(
          or(
            eq(genres.slug, genre),
            eq(genres.id, genre),
            like(genres.name, `%${genre}%`)
          )
        );

      genreComicIds = Array.from(new Set(matched.map((m) => m.comicId)));
      if (genreComicIds.length === 0) {
        return { comics: [], total: 0 };
      }
    }

    const conditions: any[] = [];

    if (q) {
      conditions.push(or(like(comics.title, `%${q}%`), like(comics.slug, `%${q}%`)));
    }
    if (status && status !== "all") {
      conditions.push(eq(comics.status, status));
    }
    if (type && type !== "all") {
      conditions.push(eq(comics.type, type));
    }
    if (genreComicIds !== null) {
      conditions.push(inArray(comics.id, genreComicIds));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await this.db
      .select({ count: count() })
      .from(comics)
      .where(whereConditions);

    let orderByClause = desc(comics.createdAt);
    if (sort === "popular") {
      orderByClause = desc(comics.totalViews);
    } else if (sort === "updated") {
      orderByClause = desc(comics.updatedAt);
    }

    const comicList = await this.db
      .select()
      .from(comics)
      .where(whereConditions)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const comicIds = comicList.map((item) => item.id);
    let comicGenresMap: Record<string, { id: string; name: string; slug: string }[]> = {};
    let comicCreatorsMap: Record<string, string[]> = {};
    let comicLatestChapterMap: Record<string, { chapterNumber: string; slug: string; title: string | null; publishedAt: Date }> = {};

    if (comicIds.length > 0) {
      const cgList = await this.db
        .select({ comicId: comicGenres.comicId, genreId: genres.id, genreName: genres.name, genreSlug: genres.slug })
        .from(comicGenres)
        .innerJoin(genres, eq(comicGenres.genreId, genres.id))
        .where(inArray(comicGenres.comicId, comicIds));

      for (const item of cgList) {
        if (!comicGenresMap[item.comicId]) comicGenresMap[item.comicId] = [];
        comicGenresMap[item.comicId].push({ id: item.genreId, name: item.genreName, slug: item.genreSlug });
      }

      const ccList = await this.db
        .select({ comicId: comicCreators.comicId, creatorName: creators.name })
        .from(comicCreators)
        .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
        .where(inArray(comicCreators.comicId, comicIds));

      for (const item of ccList) {
        if (!comicCreatorsMap[item.comicId]) comicCreatorsMap[item.comicId] = [];
        comicCreatorsMap[item.comicId].push(item.creatorName);
      }

      const chList = await this.db
        .select({
          comicId: chapters.comicId,
          chapterNumber: chapters.chapterNumber,
          slug: chapters.slug,
          title: chapters.title,
          publishedAt: chapters.publishedAt,
        })
        .from(chapters)
        .where(inArray(chapters.comicId, comicIds))
        .orderBy(desc(chapters.publishedAt), desc(chapters.chapterNumber));

      for (const ch of chList) {
        if (!comicLatestChapterMap[ch.comicId]) {
          comicLatestChapterMap[ch.comicId] = ch;
        }
      }
    }

    const enrichedComics = comicList.map((item) => ({
      ...item,
      genres: comicGenresMap[item.id] || [],
      creators: comicCreatorsMap[item.id] || [],
      latestChapter: comicLatestChapterMap[item.id] || null,
    }));

    return {
      comics: enrichedComics,
      total: totalRes?.count || 0,
    };
  }

  async findById(id: string) {
    const [comic] = await this.db.select().from(comics).where(eq(comics.id, id));
    if (!comic) return null;

    const linkedGenres = await this.db
      .select({ id: genres.id, name: genres.name, slug: genres.slug })
      .from(comicGenres)
      .innerJoin(genres, eq(comicGenres.genreId, genres.id))
      .where(eq(comicGenres.comicId, id));

    const linkedCreators = await this.db
      .select({ id: creators.id, name: creators.name, role: comicCreators.role })
      .from(comicCreators)
      .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
      .where(eq(comicCreators.comicId, id));

    return {
      comic,
      genres: linkedGenres,
      creators: linkedCreators,
    };
  }

  async findBySlug(slug: string) {
    const [comic] = await this.db.select().from(comics).where(eq(comics.slug, slug));
    if (!comic) return null;

    const linkedGenres = await this.db
      .select({ id: genres.id, name: genres.name, slug: genres.slug })
      .from(comicGenres)
      .innerJoin(genres, eq(comicGenres.genreId, genres.id))
      .where(eq(comicGenres.comicId, comic.id));

    const linkedCreators = await this.db
      .select({ id: creators.id, name: creators.name, role: comicCreators.role })
      .from(comicCreators)
      .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
      .where(eq(comicCreators.comicId, comic.id));

    const comicChapters = await this.db
      .select()
      .from(chapters)
      .where(eq(chapters.comicId, comic.id))
      .orderBy(asc(chapters.chapterNumber));

    return {
      comic,
      genres: linkedGenres,
      creators: linkedCreators,
      chapters: comicChapters,
    };
  }

  async create(data: typeof comics.$inferInsert) {
    const [newComic] = await this.db.insert(comics).values(data).returning();
    return newComic;
  }

  async update(id: string, data: Partial<typeof comics.$inferInsert>) {
    const [updatedComic] = await this.db
      .update(comics)
      .set(data)
      .where(eq(comics.id, id))
      .returning();
    return updatedComic;
  }

  async delete(id: string) {
    await this.db.delete(comics).where(eq(comics.id, id));
  }

  async syncGenres(comicId: string, genreIds: string[]) {
    await this.db.delete(comicGenres).where(eq(comicGenres.comicId, comicId));
    if (genreIds.length > 0) {
      await this.db.insert(comicGenres).values(
        genreIds.map((gId) => ({ comicId, genreId: gId }))
      );
    }
  }

  async syncCreator(comicId: string, creatorName: string, slugifyFn: (t: string) => string) {
    if (!creatorName) return;
    const creatorSlug = slugifyFn(creatorName);

    let [existingCreator] = await this.db
      .select()
      .from(creators)
      .where(eq(creators.slug, creatorSlug));

    if (!existingCreator) {
      [existingCreator] = await this.db
        .insert(creators)
        .values({ name: creatorName, slug: creatorSlug })
        .returning();
    }

    await this.db.delete(comicCreators).where(eq(comicCreators.comicId, comicId));
    if (existingCreator) {
      await this.db.insert(comicCreators).values({
        comicId,
        creatorId: existingCreator.id,
        role: "author",
      });
    }
  }

  async findTrending(period: "daily" | "weekly" | "popular" = "daily", limit: number = 10) {
    let comicIds: string[] = [];

    if (period === "popular") {
      const popularComics = await this.db
        .select({ id: comics.id })
        .from(comics)
        .orderBy(desc(comics.totalViews), desc(comics.createdAt))
        .limit(limit);

      comicIds = popularComics.map((c) => c.id);
    } else {
      const hoursAgo = period === "daily" ? 24 : 168; // 24h vs 7d (168h)
      const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      const trendingLogs = await this.db
        .select({
          comicId: comicViewLogs.comicId,
          viewCount: count(comicViewLogs.id),
        })
        .from(comicViewLogs)
        .where(gte(comicViewLogs.viewedAt, cutoff))
        .groupBy(comicViewLogs.comicId)
        .orderBy(desc(count(comicViewLogs.id)))
        .limit(limit);

      comicIds = trendingLogs.map((l) => l.comicId);

      // Fallback: If view logs in cutoff period are less than limit, backfill with top totalViews comics
      if (comicIds.length < limit) {
        const remainingLimit = limit - comicIds.length;
        const fallbackComics = await this.db
          .select({ id: comics.id })
          .from(comics)
          .where(comicIds.length > 0 ? notInArray(comics.id, comicIds) : undefined)
          .orderBy(desc(comics.totalViews))
          .limit(remainingLimit);

        comicIds = [...comicIds, ...fallbackComics.map((c) => c.id)];
      }
    }

    if (comicIds.length === 0) {
      return { comics: [], total: 0 };
    }

    // Fetch full comic objects preserving order of comicIds
    const comicList = await this.db
      .select()
      .from(comics)
      .where(inArray(comics.id, comicIds));

    // Sort comicList to match comicIds order
    const comicMap = new Map(comicList.map((c) => [c.id, c]));
    const sortedComics = comicIds
      .map((id) => comicMap.get(id))
      .filter((c): c is typeof comics.$inferSelect => Boolean(c));

    // Enrich with genres & creators
    let comicGenresMap: Record<string, { id: string; name: string; slug: string }[]> = {};
    let comicCreatorsMap: Record<string, string[]> = {};

    const fetchedIds = sortedComics.map((c) => c.id);
    if (fetchedIds.length > 0) {
      const cgList = await this.db
        .select({ comicId: comicGenres.comicId, genreId: genres.id, genreName: genres.name, genreSlug: genres.slug })
        .from(comicGenres)
        .innerJoin(genres, eq(comicGenres.genreId, genres.id))
        .where(inArray(comicGenres.comicId, fetchedIds));

      for (const item of cgList) {
        if (!comicGenresMap[item.comicId]) comicGenresMap[item.comicId] = [];
        comicGenresMap[item.comicId].push({ id: item.genreId, name: item.genreName, slug: item.genreSlug });
      }

      const ccList = await this.db
        .select({ comicId: comicCreators.comicId, creatorName: creators.name })
        .from(comicCreators)
        .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
        .where(inArray(comicCreators.comicId, fetchedIds));

      for (const item of ccList) {
        if (!comicCreatorsMap[item.comicId]) comicCreatorsMap[item.comicId] = [];
        comicCreatorsMap[item.comicId].push(item.creatorName);
      }
    }

    const enrichedComics = sortedComics.map((item) => ({
      ...item,
      genres: comicGenresMap[item.id] || [],
      creators: comicCreatorsMap[item.id] || [],
    }));

    return {
      comics: enrichedComics,
      total: enrichedComics.length,
    };
  }
}

