import { createDbClient, genres } from "@/db";
import type { DbClient } from "@/db";
import type { Genre } from "@/db/schema/genres";
import { eq } from "drizzle-orm";

const genreNameCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
  ignorePunctuation: false,
});

function compareCodePointStrings(left: string, right: string) {
  const leftPoints = Array.from(left, (character) => character.codePointAt(0)!);
  const rightPoints = Array.from(right, (character) => character.codePointAt(0)!);
  const sharedLength = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) {
      return leftPoints[index] - rightPoints[index];
    }
  }

  return leftPoints.length - rightPoints.length;
}

export function compareGenreNames(
  left: Pick<Genre, "id" | "name" | "slug">,
  right: Pick<Genre, "id" | "name" | "slug">,
) {
  return (
    genreNameCollator.compare(left.name, right.name) ||
    compareCodePointStrings(left.name.normalize("NFKC"), right.name.normalize("NFKC")) ||
    compareCodePointStrings(left.name, right.name) ||
    compareCodePointStrings(left.slug, right.slug) ||
    compareCodePointStrings(left.id, right.id)
  );
}

export function sortGenres<T extends Pick<Genre, "id" | "name" | "slug">>(genreList: T[]) {
  return [...genreList].sort(compareGenreNames);
}

export class GenreRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findAll() {
    const genreList = await this.db.select().from(genres);
    return sortGenres(genreList);
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
