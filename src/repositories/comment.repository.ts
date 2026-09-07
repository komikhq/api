import { createDbClient, comments, commentLikes, commentMentions, commentReports, users } from "@/db";
import type { DbClient } from "@/db";
import { eq, and, or, isNull, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export class CommentRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findByTarget(comicId?: string, chapterId?: string) {
    const condition = chapterId
      ? eq(comments.chapterId, chapterId)
      : comicId
      ? and(eq(comments.comicId, comicId), isNull(comments.chapterId))
      : eq(comments.comicId, "");

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
        isSpoiler: comments.isSpoiler,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        isEdited: comments.isEdited,
        isDeleted: comments.isDeleted,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          name: sql<string>`COALESCE(${users.name}, ${comments.guestName}, 'Guest')`,
          image: users.image,
          isGuest: sql<boolean>`${comments.userId} IS NULL`,
        },
        replyToUser: {
          id: replyUsers.id,
          name: replyUsers.name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(replyUsers, eq(comments.replyToUserId, replyUsers.id))
      .where(condition)
      .orderBy(desc(comments.createdAt));
  }

  async findFormattedById(id: string) {
    const replyUsers = alias(users, "reply_users");

    const [formatted] = await this.db
      .select({
        id: comments.id,
        comicId: comments.comicId,
        chapterId: comments.chapterId,
        rootId: comments.rootId,
        parentId: comments.parentId,
        depth: comments.depth,
        content: comments.content,
        isSpoiler: comments.isSpoiler,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        isEdited: comments.isEdited,
        isDeleted: comments.isDeleted,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          name: sql<string>`COALESCE(${users.name}, ${comments.guestName}, 'Guest')`,
          image: users.image,
          isGuest: sql<boolean>`${comments.userId} IS NULL`,
        },
        replyToUser: {
          id: replyUsers.id,
          name: replyUsers.name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(replyUsers, eq(comments.replyToUserId, replyUsers.id))
      .where(eq(comments.id, id));

    return formatted || null;
  }

  async findById(id: string) {
    const [comment] = await this.db.select().from(comments).where(eq(comments.id, id));
    return comment || null;
  }

  async create(data: {
    userId?: string | null;
    guestName?: string | null;
    guestEmail?: string | null;
    isSpoiler?: boolean;
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
      userId: data.userId || null,
      guestName: data.guestName || null,
      guestEmail: data.guestEmail || null,
      isSpoiler: data.isSpoiler ?? false,
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

  async softDelete(commentId: string, userId?: string | null, isAdmin?: boolean) {
    const comment = await this.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (!isAdmin && comment.userId !== userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    const [updated] = await this.db
      .update(comments)
      .set({ isDeleted: true, content: "[Komentar ini telah dihapus]" })
      .where(eq(comments.id, commentId))
      .returning();

    return updated;
  }

  async createReport(data: {
    commentId: string;
    reporterUserId?: string | null;
    reporterGuestName?: string | null;
    reporterGuestEmail?: string | null;
    reason: string;
    details?: string | null;
  }) {
    const comment = await this.findById(data.commentId);
    if (!comment) throw new Error("Comment not found");

    const [inserted] = await this.db
      .insert(commentReports)
      .values({
        commentId: data.commentId,
        reporterUserId: data.reporterUserId || null,
        reporterGuestName: data.reporterGuestName || null,
        reporterGuestEmail: data.reporterGuestEmail || null,
        reason: data.reason,
        details: data.details || null,
        status: "PENDING",
      })
      .returning();

    return inserted;
  }

  async listReports(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const condition = status ? eq(commentReports.status, status) : undefined;

    const items = await this.db
      .select({
        id: commentReports.id,
        commentId: commentReports.commentId,
        reason: commentReports.reason,
        details: commentReports.details,
        status: commentReports.status,
        createdAt: commentReports.createdAt,
        reporterName: sql<string>`COALESCE(${users.name}, ${commentReports.reporterGuestName}, 'Guest')`,
        commentContent: comments.content,
        commentIsDeleted: comments.isDeleted,
      })
      .from(commentReports)
      .leftJoin(comments, eq(commentReports.commentId, comments.id))
      .leftJoin(users, eq(commentReports.reporterUserId, users.id))
      .where(condition)
      .orderBy(desc(commentReports.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(commentReports)
      .where(condition);

    return {
      reports: items,
      total: Number(totalCount?.count || 0),
      page,
      limit,
    };
  }

  async resolveReport(reportId: string, action: "delete_comment" | "dismiss") {
    const [report] = await this.db
      .select()
      .from(commentReports)
      .where(eq(commentReports.id, reportId));

    if (!report) throw new Error("Report not found");

    if (action === "delete_comment") {
      await this.softDelete(report.commentId, null, true);
    }

    const [updated] = await this.db
      .update(commentReports)
      .set({ status: action === "delete_comment" ? "RESOLVED" : "DISMISSED" })
      .where(eq(commentReports.id, reportId))
      .returning();

    return updated;
  }
}
