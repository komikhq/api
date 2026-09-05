import { pgTable, uuid, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { chapters } from "./chapters";

export const chapterPages = pgTable(
  "chapter_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    imageUrl: text("image_url").notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("chapter_page_number_idx").on(table.chapterId, table.pageNumber),
  ]
);

export type ChapterPage = typeof chapterPages.$inferSelect;
export type NewChapterPage = typeof chapterPages.$inferInsert;
