import { createDbClient, bookmarks, comics } from "@/db";
import type { DbClient } from "@/db";
import { eq, and } from "drizzle-orm";

export class BookmarkRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findByUserId(userId: string) {
    return this.db
      .select({
        id: bookmarks.id,
        status: bookmarks.status,
        createdAt: bookmarks.createdAt,
        comic: comics,
      })
      .from(bookmarks)
      .innerJoin(comics, eq(bookmarks.comicId, comics.id))
      .where(eq(bookmarks.userId, userId));
  }

  async findExisting(userId: string, comicId: string) {
    const [existing] = await this.db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.comicId, comicId)));
    return existing || null;
  }

  async upsert(userId: string, comicId: string, status: string = "reading") {
    const existing = await this.findExisting(userId, comicId);
    if (existing) {
      await this.db
        .update(bookmarks)
        .set({ status, updatedAt: new Date() })
        .where(eq(bookmarks.id, existing.id));
      return { action: "updated" };
    }

    await this.db.insert(bookmarks).values({
      id: crypto.randomUUID(),
      userId,
      comicId,
      status,
    });
    return { action: "added" };
  }

  async delete(userId: string, comicId: string) {
    await this.db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.comicId, comicId)));
  }
}
