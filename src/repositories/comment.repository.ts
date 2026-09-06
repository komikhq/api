import { createDbClient, comments, commentLikes, users } from "@/db";
import type { DbClient } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";

export class CommentRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findByTarget(comicId?: string, chapterId?: string) {
    const condition = comicId
      ? eq(comments.comicId, comicId)
      : eq(comments.chapterId, chapterId!);

    return this.db
      .select({
        id: comments.id,
        content: comments.content,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(condition)
      .orderBy(desc(comments.createdAt));
  }

  async create(data: { userId: string; comicId?: string | null; chapterId?: string | null; parentId?: string | null; content: string }) {
    const insertValues: typeof comments.$inferInsert = {
      userId: data.userId,
      comicId: data.comicId || "",
      chapterId: data.chapterId || "",
      content: data.content,
      parentId: data.parentId || null,
    };

    const [inserted] = await this.db.insert(comments).values(insertValues).returning();
    return inserted;
  }

  async toggleLike(userId: string, commentId: string) {
    const [existingLike] = await this.db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)));

    if (existingLike) {
      await this.db
        .delete(commentLikes)
        .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)));

      await this.db
        .update(comments)
        .set({ likeCount: sql`${comments.likeCount} - 1` })
        .where(eq(comments.id, commentId));

      return { liked: false };
    }

    await this.db.insert(commentLikes).values({
      userId,
      commentId,
    });

    await this.db
      .update(comments)
      .set({ likeCount: sql`${comments.likeCount} + 1` })
      .where(eq(comments.id, commentId));

    return { liked: true };
  }
}
