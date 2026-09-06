import { createDbClient, chapters, chapterPages, comics } from "@/db";
import type { DbClient } from "@/db";
import { eq, count, asc } from "drizzle-orm";

export class ChapterRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findByComicId(comicId: string) {
    return this.db
      .select()
      .from(chapters)
      .where(eq(chapters.comicId, comicId))
      .orderBy(asc(chapters.chapterNumber));
  }

  async findById(chapterId: string) {
    const [chapter] = await this.db.select().from(chapters).where(eq(chapters.id, chapterId));
    if (!chapter) return null;

    const pages = await this.db
      .select()
      .from(chapterPages)
      .where(eq(chapterPages.chapterId, chapterId))
      .orderBy(asc(chapterPages.pageNumber));

    return { chapter, pages };
  }

  async createChapter(data: typeof chapters.$inferInsert) {
    const [newChapter] = await this.db.insert(chapters).values(data).returning();
    return newChapter;
  }

  async createPageRecord(chapterId: string, pageNumber: number, imageUrl: string) {
    const [pageRecord] = await this.db
      .insert(chapterPages)
      .values({
        chapterId,
        pageNumber,
        imageUrl,
      })
      .returning();
    return pageRecord;
  }

  async updateComicTotalChapters(comicId: string) {
    const [totalChaptersRes] = await this.db
      .select({ count: count() })
      .from(chapters)
      .where(eq(chapters.comicId, comicId));

    await this.db
      .update(comics)
      .set({ totalChapters: totalChaptersRes?.count || 0, updatedAt: new Date() })
      .where(eq(comics.id, comicId));
  }

  async update(chapterId: string, data: Partial<typeof chapters.$inferInsert>) {
    const [updated] = await this.db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, chapterId))
      .returning();
    return updated;
  }

  async delete(chapterId: string) {
    await this.db.delete(chapters).where(eq(chapters.id, chapterId));
  }
}
