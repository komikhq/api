import { createDbClient, ratings } from "@/db";
import type { DbClient } from "@/db";
import { eq, and } from "drizzle-orm";

export class RatingRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async upsert(userId: string, comicId: string, score: number) {
    const [existingRating] = await this.db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.comicId, comicId)));

    if (existingRating) {
      await this.db
        .update(ratings)
        .set({ score, updatedAt: new Date() })
        .where(eq(ratings.id, existingRating.id));

      return { action: "updated" };
    }

    await this.db.insert(ratings).values({
      id: crypto.randomUUID(),
      userId,
      comicId,
      score,
    });

    return { action: "submitted" };
  }
}
