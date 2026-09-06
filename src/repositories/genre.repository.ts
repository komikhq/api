import { createDbClient, genres } from "@/db";
import type { DbClient } from "@/db";
import { eq, desc } from "drizzle-orm";

export class GenreRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findAll() {
    return this.db.select().from(genres).orderBy(desc(genres.createdAt));
  }

  async findById(id: string) {
    const [genre] = await this.db.select().from(genres).where(eq(genres.id, id));
    return genre || null;
  }

  async findBySlug(slug: string) {
    const [genre] = await this.db.select().from(genres).where(eq(genres.slug, slug));
    return genre || null;
  }

  async create(data: typeof genres.$inferInsert) {
    const [newGenre] = await this.db.insert(genres).values(data).returning();
    return newGenre;
  }

  async update(id: string, data: Partial<typeof genres.$inferInsert>) {
    const [updated] = await this.db.update(genres).set(data).where(eq(genres.id, id)).returning();
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(genres).where(eq(genres.id, id));
  }
}
