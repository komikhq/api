import { createDbClient, comics, comicGenres, genres, creators, comicCreators } from "@/db";
import type { DbClient } from "@/db";
import { eq, like, or, and, count, desc, inArray } from "drizzle-orm";

export interface ListComicsParams {
  q?: string;
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
    const { q, status, page, limit } = params;
    const offset = (page - 1) * limit;

    let whereConditions: any = undefined;
    if (q && status && status !== "all") {
      whereConditions = and(or(like(comics.title, `%${q}%`), like(comics.slug, `%${q}%`)), eq(comics.status, status));
    } else if (q) {
      whereConditions = or(like(comics.title, `%${q}%`), like(comics.slug, `%${q}%`));
    } else if (status && status !== "all") {
      whereConditions = eq(comics.status, status);
    }

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
    let comicGenresMap: Record<string, { id: string; name: string }[]> = {};
    let comicCreatorsMap: Record<string, string[]> = {};

    if (comicIds.length > 0) {
      const cgList = await this.db
        .select({ comicId: comicGenres.comicId, genreId: genres.id, genreName: genres.name })
        .from(comicGenres)
        .innerJoin(genres, eq(comicGenres.genreId, genres.id))
        .where(inArray(comicGenres.comicId, comicIds));

      for (const item of cgList) {
        if (!comicGenresMap[item.comicId]) comicGenresMap[item.comicId] = [];
        comicGenresMap[item.comicId].push({ id: item.genreId, name: item.genreName });
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
      .innerJoin(creators, eq(comicCreators.creatorId, id))
      .where(eq(comicCreators.comicId, id));

    return {
      comic,
      genres: linkedGenres,
      creators: linkedCreators,
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
