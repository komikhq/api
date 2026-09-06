import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { createDbClient, genres } from "@/db";
import { eq, desc } from "drizzle-orm";

export const adminGenreRoutes = new Hono<AppEnv>();

// Require admin role for all routes here
adminGenreRoutes.use("*", requireAdmin());

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /v1/admin/genres - List all genres
adminGenreRoutes.get("/genres", async (c) => {
  const db = createDbClient(c.env.DATABASE_URL);
  const genreList = await db.select().from(genres).orderBy(desc(genres.createdAt));
  return c.json({ genres: genreList });
});

// POST /v1/admin/genres - Create genre
adminGenreRoutes.post("/genres", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return c.json({ error: "Nama genre wajib diisi." }, 400);
    }

    const slug = slugify(name);
    const db = createDbClient(c.env.DATABASE_URL);

    const [existing] = await db.select().from(genres).where(eq(genres.slug, slug));
    if (existing) {
      return c.json({ error: `Genre dengan nama atau slug "${name}" sudah ada.` }, 400);
    }

    const [newGenre] = await db
      .insert(genres)
      .values({
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
      })
      .returning();

    return c.json({ success: true, genre: newGenre });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal membuat genre." }, 500);
  }
});

// PUT /v1/admin/genres/:id - Update genre
adminGenreRoutes.put("/genres/:id", async (c) => {
  try {
    const genreId = c.req.param("id");
    const body = await c.req.json();
    const { name, description } = body;

    const db = createDbClient(c.env.DATABASE_URL);
    const [existing] = await db.select().from(genres).where(eq(genres.id, genreId));
    if (!existing) {
      return c.json({ error: "Genre tidak ditemukan." }, 404);
    }

    const updateData: Partial<typeof genres.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name && typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
      updateData.slug = slugify(name);
    }
    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    const [updated] = await db
      .update(genres)
      .set(updateData)
      .where(eq(genres.id, genreId))
      .returning();

    return c.json({ success: true, genre: updated });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal memperbarui genre." }, 500);
  }
});

// DELETE /v1/admin/genres/:id - Delete genre
adminGenreRoutes.delete("/genres/:id", async (c) => {
  try {
    const genreId = c.req.param("id");
    const db = createDbClient(c.env.DATABASE_URL);

    const [existing] = await db.select().from(genres).where(eq(genres.id, genreId));
    if (!existing) {
      return c.json({ error: "Genre tidak ditemukan." }, 404);
    }

    await db.delete(genres).where(eq(genres.id, genreId));
    return c.json({ success: true, message: `Genre "${existing.name}" berhasil dihapus.` });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal menghapus genre." }, 500);
  }
});
