import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

export const comics = pgTable("comics", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  synopsis: text("synopsis"),
  coverUrl: text("cover_url").notNull(),
  bannerUrl: text("banner_url"),
  status: varchar("status", { length: 20 }).notNull().default("ongoing"),
  accessTier: varchar("access_tier", { length: 20 }).notNull().default("free"),
  totalChapters: integer("total_chapters").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Comic = typeof comics.$inferSelect;
export type NewComic = typeof comics.$inferInsert;
