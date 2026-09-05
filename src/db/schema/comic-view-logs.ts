import { pgTable, uuid, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { comics } from "./comics";
import { chapters } from "./chapters";
import { users } from "./users";

export const comicViewLogs = pgTable(
  "comic_view_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    comicId: uuid("comic_id")
      .notNull()
      .references(() => comics.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    ipHash: varchar("ip_hash", { length: 64 }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("comic_viewed_at_idx").on(table.comicId, table.viewedAt),
    index("chapter_viewed_at_idx").on(table.chapterId, table.viewedAt),
  ]
);

export type ComicViewLog = typeof comicViewLogs.$inferSelect;
export type NewComicViewLog = typeof comicViewLogs.$inferInsert;
