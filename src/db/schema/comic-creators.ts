import { pgTable, uuid, varchar, primaryKey } from "drizzle-orm/pg-core";
import { comics } from "./comics";
import { creators } from "./creators";

export const comicCreators = pgTable(
  "comic_creators",
  {
    comicId: uuid("comic_id")
      .notNull()
      .references(() => comics.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull().default("author"),
  },
  (table) => [
    primaryKey({ columns: [table.comicId, table.creatorId, table.role] }),
  ]
);

export type ComicCreator = typeof comicCreators.$inferSelect;
export type NewComicCreator = typeof comicCreators.$inferInsert;
