import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient, readingHistories, comics, chapters } from "@/db";
import { eq, and, desc } from "drizzle-orm";

export const historyRoutes = new Hono<AppEnv>();

historyRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDbClient(c.env.DATABASE_URL);
  const result = await db
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
    .where(eq(readingHistories.userId, user.userId))
    .orderBy(desc(readingHistories.updatedAt));

  return c.json({ history: result });
});

historyRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { comicId, chapterId, lastReadPage = 1, snapshotTotalPages = 1 } = await c.req.json();
  if (!comicId || !chapterId) {
    return c.json({ error: "comicId and chapterId are required" }, 400);
  }

  const db = createDbClient(c.env.DATABASE_URL);

  const [existing] = await db
    .select()
    .from(readingHistories)
    .where(
      and(
        eq(readingHistories.userId, user.userId),
        eq(readingHistories.comicId, comicId)
      )
    );

  if (existing) {
    await db
      .update(readingHistories)
      .set({
        chapterId,
        lastReadPage,
        snapshotTotalPages,
        updatedAt: new Date(),
      })
      .where(eq(readingHistories.id, existing.id));

    return c.json({ success: true, message: "Reading history updated" });
  }

  await db.insert(readingHistories).values({
    userId: user.userId,
    comicId,
    chapterId,
    lastReadPage,
    snapshotTotalPages,
  });

  return c.json({ success: true, message: "Reading history created" });
});
