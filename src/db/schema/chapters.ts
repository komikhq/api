import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { comics } from "./comics";

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    comicId: uuid("comic_id")
      .notNull()
      .references(() => comics.id, { onDelete: "cascade" }),
    chapterNumber: numeric("chapter_number", { precision: 7, scale: 2 }).notNull(),
    title: varchar("title", { length: 255 }),
    slug: varchar("slug", { length: 255 }).notNull(),
    totalPages: integer("total_pages").notNull().default(0),
    accessTier: varchar("access_tier", { length: 20 }),
    isEarlyAccess: boolean("is_early_access").notNull().default(false),
    freeReleaseAt: timestamp("free_release_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("comic_chapter_number_idx").on(table.comicId, table.chapterNumber),
  ]
);

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
