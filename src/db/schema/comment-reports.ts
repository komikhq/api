import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { comments } from "./comments";
import { users } from "./users";

export const commentReports = pgTable("comment_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  reporterUserId: text("reporter_user_id").references(() => users.id, { onDelete: "set null" }),
  reporterGuestName: text("reporter_guest_name"),
  reporterGuestEmail: text("reporter_guest_email"),
  reason: varchar("reason", { length: 50 }).notNull(), // SPAM, HARASSMENT, SPOILER, NSFW, OTHER
  details: text("details"),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING, RESOLVED, DISMISSED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CommentReport = typeof commentReports.$inferSelect;
export type NewCommentReport = typeof commentReports.$inferInsert;
