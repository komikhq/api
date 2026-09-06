import { createDbClient, readingHistories, comics, chapters } from "@/db";
import type { DbClient } from "@/db";
import { eq, and, desc } from "drizzle-orm";

export class HistoryRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findByUserId(userId: string) {
    return this.db
      .select({
        id: readingHistories.id,
        lastReadPage: readingHistories.lastReadPage,
        snapshotTotalPages: readingHistories.snapshotTotalPages,
        updatedAt: readingHistories.updatedAt,
        comic: comics,
        chapter: chapters,
      })
      .from(readingHistories)
      .innerJoin(comics, eq(readingHistories.comicId, comics.id))
      .innerJoin(chapters, eq(readingHistories.chapterId, chapters.id))
      .where(eq(readingHistories.userId, userId))
      .orderBy(desc(readingHistories.updatedAt));
  }

  async upsert(userId: string, comicId: string, chapterId: string, lastReadPage: number = 1, snapshotTotalPages: number = 1) {
    const [existing] = await this.db
      .select()
      .from(readingHistories)
      .where(
        and(
          eq(readingHistories.userId, userId),
          eq(readingHistories.comicId, comicId)
        )
      );

    if (existing) {
      await this.db
        .update(readingHistories)
        .set({
          chapterId,
          lastReadPage,
          snapshotTotalPages,
          updatedAt: new Date(),
        })
        .where(eq(readingHistories.id, existing.id));

      return { action: "updated" };
    }

    await this.db.insert(readingHistories).values({
      userId,
      comicId,
      chapterId,
      lastReadPage,
      snapshotTotalPages,
    });

    return { action: "created" };
  }
}
