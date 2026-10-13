import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const genres = pgTable("genres", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
