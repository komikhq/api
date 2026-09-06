import { createDbClient, comics, comicGenres, genres, creators, comicCreators, chapters } from "@/db";
import type { DbClient } from "@/db";
import { eq, like, or, and, count, desc, asc, inArray } from "drizzle-orm";

export interface ListComicsParams {
  q?: string;
  genre?: string;
  status?: string;
  page: number;
  limit: number;
}

export class ComicRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findManyWithPagination(params: ListComicsParams) {
    const { q, genre, status, page, limit } = params;
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
    if (genreComicIds !== null) {
      conditions.push(inArray(comics.id, genreComicIds));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await this.db
      .select({ count: count() })
      .from(comics)
      .where(whereConditions);

    const comicList = await this.db
      .select()
      .from(comics)
      .where(whereConditions)
      .orderBy(desc(comics.createdAt))
      .limit(limit)
      .offset(offset);

    const comicIds = comicList.map((item) => item.id);
    let comicGenresMap: Record<string, { id: string; name: string; slug: string }[]> = {};
    let comicCreatorsMap: Record<string, string[]> = {};

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
    }

    const enrichedComics = comicList.map((item) => ({
      ...item,
      genres: comicGenresMap[item.id] || [],
      creators: comicCreatorsMap[item.id] || [],
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
}

