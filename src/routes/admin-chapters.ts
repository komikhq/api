import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { createDbClient, comics, chapters, chapterPages } from "@/db";
import { eq, and, count, asc } from "drizzle-orm";
import { uploadToR2, deleteFromR2, type StorageEnv } from "@/lib/storage";

export const adminChapterRoutes = new Hono<AppEnv>();

adminChapterRoutes.use("*", requireAdmin());

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /v1/admin/comics/:comicId/chapters - List chapters for comic
adminChapterRoutes.get("/comics/:comicId/chapters", async (c) => {
  const comicId = c.req.param("comicId");
  const db = createDbClient(c.env.DATABASE_URL);

  const chapterList = await db
    .select()
    .from(chapters)
    .where(eq(chapters.comicId, comicId))
    .orderBy(asc(chapters.chapterNumber));

  return c.json({ chapters: chapterList });
});

// POST /v1/admin/comics/:comicId/chapters - Create chapter with multi-page images
adminChapterRoutes.post("/comics/:comicId/chapters", async (c) => {
  try {
    const comicId = c.req.param("comicId");
    const db = createDbClient(c.env.DATABASE_URL);

    const [comic] = await db.select().from(comics).where(eq(comics.id, comicId));
    if (!comic) {
      return c.json({ error: "Komik tidak ditemukan." }, 404);
    }

    const formData = await c.req.formData();
    const chapterNumberStr = formData.get("chapterNumber")?.toString().trim();
    const title = formData.get("title")?.toString().trim() || "";
    const accessTier = formData.get("accessTier")?.toString().trim() || "free";
    const isEarlyAccess = formData.get("isEarlyAccess")?.toString() === "true";

    if (!chapterNumberStr) {
      return c.json({ error: "Nomor chapter wajib diisi." }, 400);
    }

    const chapterNumber = parseFloat(chapterNumberStr);
    const chapterSlug = `ch-${chapterNumberStr}`;

    // Get all attached page files
    const pageFiles = formData.getAll("pages") as File[];
    const validPages = pageFiles.filter((f) => f && typeof f === "object" && f.size > 0);

    // Insert Chapter DB record
    const [newChapter] = await db
      .insert(chapters)
      .values({
        comicId,
        chapterNumber: chapterNumber.toString(),
        title: title || `Chapter ${chapterNumberStr}`,
        slug: chapterSlug,
        totalPages: validPages.length,
        accessTier,
        isEarlyAccess,
      })
      .returning();

    // Upload page images to R2 sequentially
    const insertedPages = [];
    for (let i = 0; i < validPages.length; i++) {
      const file = validPages[i];
      const ext = file.name.split(".").pop() || "webp";
      const pageNum = i + 1;
      const objectKey = `comics/${comic.slug}/ch-${chapterNumberStr}/page-${pageNum}-${Date.now()}.${ext}`;

      const buffer = await file.arrayBuffer();
      const imageUrl = await uploadToR2(c.env as StorageEnv, "media", objectKey, buffer, {
        contentType: file.type || "image/webp",
      });

      const [pageRecord] = await db
        .insert(chapterPages)
        .values({
          chapterId: newChapter.id,
          pageNumber: pageNum,
          imageUrl,
        })
        .returning();

      insertedPages.push(pageRecord);
    }

    // Update totalChapters on comic
    const [totalChaptersRes] = await db
      .select({ count: count() })
      .from(chapters)
      .where(eq(chapters.comicId, comicId));

    await db
      .update(comics)
      .set({ totalChapters: totalChaptersRes?.count || 0, updatedAt: new Date() })
      .where(eq(comics.id, comicId));

    return c.json({
      success: true,
      chapter: newChapter,
      pages: insertedPages,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal membuat chapter baru." }, 500);
  }
});

// GET /v1/admin/comics/:comicId/chapters/:id - Get chapter detail + pages
adminChapterRoutes.get("/comics/:comicId/chapters/:id", async (c) => {
  const chapterId = c.req.param("id");
  const db = createDbClient(c.env.DATABASE_URL);

  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
  if (!chapter) {
    return c.json({ error: "Chapter tidak ditemukan." }, 404);
  }

  const pages = await db
    .select()
    .from(chapterPages)
    .where(eq(chapterPages.chapterId, chapterId))
    .orderBy(asc(chapterPages.pageNumber));

  return c.json({ chapter, pages });
});

// PUT /v1/admin/comics/:comicId/chapters/:id - Update chapter metadata
adminChapterRoutes.put("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const chapterId = c.req.param("id");
    const db = createDbClient(c.env.DATABASE_URL);

    const body = await c.req.json();
    const { title, chapterNumber, accessTier, isEarlyAccess } = body;

    const [existing] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
    if (!existing) {
      return c.json({ error: "Chapter tidak ditemukan." }, 404);
    }

    const updateData: Partial<typeof chapters.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (chapterNumber !== undefined) updateData.chapterNumber = chapterNumber.toString();
    if (accessTier !== undefined) updateData.accessTier = accessTier;
    if (isEarlyAccess !== undefined) updateData.isEarlyAccess = Boolean(isEarlyAccess);

    const [updated] = await db
      .update(chapters)
      .set(updateData)
      .where(eq(chapters.id, chapterId))
      .returning();

    return c.json({ success: true, chapter: updated });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal memperbarui metadata chapter." }, 500);
  }
});

// DELETE /v1/admin/comics/:comicId/chapters/:id - Delete chapter
adminChapterRoutes.delete("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const comicId = c.req.param("comicId");
    const chapterId = c.req.param("id");
    const db = createDbClient(c.env.DATABASE_URL);

    const [existing] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
    if (!existing) {
      return c.json({ error: "Chapter tidak ditemukan." }, 404);
    }

    await db.delete(chapters).where(eq(chapters.id, chapterId));

    // Update totalChapters on comic
    const [totalChaptersRes] = await db
      .select({ count: count() })
      .from(chapters)
      .where(eq(chapters.comicId, comicId));

    await db
      .update(comics)
      .set({ totalChapters: totalChaptersRes?.count || 0, updatedAt: new Date() })
      .where(eq(comics.id, comicId));

    return c.json({ success: true, message: `Chapter ${existing.chapterNumber} berhasil dihapus.` });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal menghapus chapter." }, 500);
  }
});
