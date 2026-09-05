import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient, ratings } from "@/db";
import { eq, and } from "drizzle-orm";

export const ratingRoutes = new Hono<AppEnv>();

ratingRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { comicId, score } = await c.req.json();
  if (!comicId || typeof score !== "number" || score < 1 || score > 5) {
    return c.json({ error: "comicId and score between 1 and 5 are required" }, 400);
  }

  const db = createDbClient(c.env.DATABASE_URL);

  const [existingRating] = await db
    .select()
    .from(ratings)
    .where(
      and(
        eq(ratings.userId, user.userId),
        eq(ratings.comicId, comicId)
      )
    );

  if (existingRating) {
    await db
      .update(ratings)
      .set({ score, updatedAt: new Date() })
      .where(eq(ratings.id, existingRating.id));

    return c.json({ success: true, message: "Rating updated", score });
  }

  await db.insert(ratings).values({
    id: crypto.randomUUID(),
    userId: user.userId,
    comicId,
    score,
  });

  return c.json({ success: true, message: "Rating submitted", score });
});
