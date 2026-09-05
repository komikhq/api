import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient, bookmarks, comics } from "@/db";
import { eq, and } from "drizzle-orm";

export const bookmarkRoutes = new Hono<AppEnv>();

bookmarkRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDbClient(c.env.DATABASE_URL);
  const result = await db
    .select({
      id: bookmarks.id,
      status: bookmarks.status,
      createdAt: bookmarks.createdAt,
      comic: comics,
    })
    .from(bookmarks)
    .innerJoin(comics, eq(bookmarks.comicId, comics.id))
    .where(eq(bookmarks.userId, user.userId));

  return c.json({ bookmarks: result });
});

bookmarkRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { comicId, status = "reading" } = await c.req.json();
  if (!comicId) return c.json({ error: "comicId is required" }, 400);

  const db = createDbClient(c.env.DATABASE_URL);

  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, user.userId), eq(bookmarks.comicId, comicId)));

  if (existing) {
    await db
      .update(bookmarks)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookmarks.id, existing.id));
    return c.json({ success: true, message: "Bookmark updated" });
  }

  await db.insert(bookmarks).values({
    id: crypto.randomUUID(),
    userId: user.userId,
    comicId,
    status,
  });

  return c.json({ success: true, message: "Bookmark added" });
});

bookmarkRoutes.delete("/:comicId", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const comicId = c.req.param("comicId");
  const db = createDbClient(c.env.DATABASE_URL);

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, user.userId), eq(bookmarks.comicId, comicId)));

  return c.json({ success: true, message: "Bookmark removed" });
});
