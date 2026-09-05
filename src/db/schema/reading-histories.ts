import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { comics } from "./comics";
import { chapters } from "./chapters";

export const readingHistories = pgTable(
  "reading_histories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    comicId: uuid("comic_id")
      .notNull()
      .references(() => comics.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    lastReadPage: integer("last_read_page").notNull().default(1),
    snapshotTotalPages: integer("snapshot_total_pages").notNull(),
    isCompleted: boolean("is_completed").notNull().default(false),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_chapter_reading_idx").on(table.userId, table.chapterId),
  ]
);

export type ReadingHistory = typeof readingHistories.$inferSelect;
export type NewReadingHistory = typeof readingHistories.$inferInsert;
