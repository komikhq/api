import { pgTable, uuid, text, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { comics } from "./comics";

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    comicId: uuid("comic_id")
      .notNull()
      .references(() => comics.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("reading"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_comic_bookmark_idx").on(table.userId, table.comicId),
  ]
);

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
