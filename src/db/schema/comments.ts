import { pgTable, uuid, text, integer, boolean, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { users } from "./users";
import { comics } from "./comics";
import { chapters } from "./chapters";

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  comicId: uuid("comic_id")
    .notNull()
    .references(() => comics.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rootId: uuid("root_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
  replyToUserId: text("reply_to_user_id").references(() => users.id, { onDelete: "set null" }),
  depth: integer("depth").notNull().default(1),
  pageNumber: integer("page_number"),
  content: text("content").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  isEdited: boolean("is_edited").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
