import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { comics } from "./comics";
import { genres } from "./genres";

export const comicGenres = pgTable(
  "comic_genres",
  {
    comicId: uuid("comic_id")
      .notNull()
      .references(() => comics.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.comicId, table.genreId] }),
  ]
);

export type ComicGenre = typeof comicGenres.$inferSelect;
export type NewComicGenre = typeof comicGenres.$inferInsert;
