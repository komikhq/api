import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient, comments, commentLikes, users } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";

export const commentRoutes = new Hono<AppEnv>();

commentRoutes.get("/", async (c) => {
  const comicId = c.req.query("comicId");
  const chapterId = c.req.query("chapterId");

  if (!comicId && !chapterId) {
    return c.json({ error: "comicId or chapterId is required" }, 400);
  }

  const db = createDbClient(c.env.DATABASE_URL);
  const condition = comicId
    ? eq(comments.comicId, comicId)
    : eq(comments.chapterId, chapterId!);

  const result = await db
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

  return c.json({ comments: result });
});

commentRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { comicId, chapterId, content, parentId } = await c.req.json();
  if (!content || (!comicId && !chapterId)) {
    return c.json({ error: "Content and target comicId or chapterId required" }, 400);
  }

  const db = createDbClient(c.env.DATABASE_URL);

  const [inserted] = await db
    .insert(comments)
    .values({
      userId: user.userId,
      comicId: comicId || null,
      chapterId: chapterId || null,
      parentId: parentId || null,
      content,
    })
    .returning();

  return c.json({ success: true, comment: inserted });
});

commentRoutes.post("/:commentId/like", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const commentId = c.req.param("commentId");
  const db = createDbClient(c.env.DATABASE_URL);

  const [existingLike] = await db
    .select()
    .from(commentLikes)
    .where(
      and(
        eq(commentLikes.userId, user.userId),
        eq(commentLikes.commentId, commentId)
      )
    );

  if (existingLike) {
    await db
      .delete(commentLikes)
      .where(
        and(
          eq(commentLikes.userId, user.userId),
          eq(commentLikes.commentId, commentId)
        )
      );

    await db
      .update(comments)
      .set({ likeCount: sql`${comments.likeCount} - 1` })
      .where(eq(comments.id, commentId));

    return c.json({ success: true, liked: false });
  }

  await db.insert(commentLikes).values({
    userId: user.userId,
    commentId,
  });

  await db
    .update(comments)
    .set({ likeCount: sql`${comments.likeCount} + 1` })
    .where(eq(comments.id, commentId));

  return c.json({ success: true, liked: true });
});
