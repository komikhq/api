import { createDbClient, comments, commentLikes, commentMentions, users } from "@/db";
import type { DbClient } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export class CommentRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findByTarget(comicId?: string, chapterId?: string) {
    const condition = comicId
      ? eq(comments.comicId, comicId)
      : eq(comments.chapterId, chapterId!);

    const replyUsers = alias(users, "reply_users");

    return this.db
      .select({
        id: comments.id,
        comicId: comments.comicId,
        chapterId: comments.chapterId,
        rootId: comments.rootId,
        parentId: comments.parentId,
        depth: comments.depth,
        content: comments.content,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        isEdited: comments.isEdited,
        isDeleted: comments.isDeleted,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        replyToUser: {
          id: replyUsers.id,
          name: replyUsers.name,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .leftJoin(replyUsers, eq(comments.replyToUserId, replyUsers.id))
      .where(condition)
      .orderBy(desc(comments.createdAt));
  }

  async findById(id: string) {
    const [comment] = await this.db.select().from(comments).where(eq(comments.id, id));
    return comment || null;
  }

  async create(data: {
    userId: string;
    comicId?: string | null;
    chapterId?: string | null;
    parentId?: string | null;
    content: string;
    mentionedUserIds?: string[];
  }) {
    let rootId: string | null = null;
    let depth = 1;
    let replyToUserId: string | null = null;

    if (data.parentId) {
      const parent = await this.findById(data.parentId);
      if (parent) {
        rootId = parent.rootId || parent.id;
        depth = parent.depth + 1;
        replyToUserId = parent.userId;
      }
    }

    const insertValues: typeof comments.$inferInsert = {
      userId: data.userId,
      comicId: data.comicId || "",
      chapterId: data.chapterId || "",
      content: data.content,
      rootId,
      parentId: data.parentId || null,
      replyToUserId,
      depth,
    };

    const [inserted] = await this.db.insert(comments).values(insertValues).returning();

    if (data.parentId) {
      await this.db
        .update(comments)
        .set({ replyCount: sql`${comments.replyCount} + 1` })
        .where(eq(comments.id, data.parentId));
    }

    if (data.mentionedUserIds && data.mentionedUserIds.length > 0) {
      for (const mUserId of data.mentionedUserIds) {
        await this.db.insert(commentMentions).values({
          commentId: inserted.id,
          mentionedUserId: mUserId,
        }).onConflictDoNothing();
      }
    }

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

