import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { createDbClient, comics, comicGenres, genres, creators, comicCreators } from "@/db";
import { eq, like, or, count, desc, inArray } from "drizzle-orm";
import { uploadToR2, deleteFromR2, type StorageEnv } from "@/lib/storage";

export const adminComicRoutes = new Hono<AppEnv>();

adminComicRoutes.use("*", requireAdmin());

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /v1/admin/comics - List comics with pagination, search, status filter
adminComicRoutes.get("/comics", async (c) => {
  const db = createDbClient(c.env.DATABASE_URL);
  const q = c.req.query("q") || "";
  const status = c.req.query("status") || "";
  const page = parseInt(c.req.query("page") || "1", 10);
  const limit = parseInt(c.req.query("limit") || "15", 10);
  const offset = (page - 1) * limit;

  let whereConditions: any = undefined;
  if (q && status) {
    whereConditions = or(like(comics.title, `%${q}%`), like(comics.slug, `%${q}%`));
    // Drizzle AND logic if status provided
  } else if (q) {
    whereConditions = or(like(comics.title, `%${q}%`), like(comics.slug, `%${q}%`));
  } else if (status) {
    whereConditions = eq(comics.status, status);
  }

  const [totalRes] = await db
    .select({ count: count() })
    .from(comics)
    .where(whereConditions);

  const comicList = await db
    .select()
    .from(comics)
    .where(whereConditions)
    .orderBy(desc(comics.createdAt))
    .limit(limit)
    .offset(offset);

  // Attach linked genres and creators for each comic
  const comicIds = comicList.map((c) => c.id);
  let comicGenresMap: Record<string, { id: string; name: string }[]> = {};
  let comicCreatorsMap: Record<string, string[]> = {};

  if (comicIds.length > 0) {
    const cgList = await db
      .select({ comicId: comicGenres.comicId, genreId: genres.id, genreName: genres.name })
      .from(comicGenres)
      .innerJoin(genres, eq(comicGenres.genreId, genres.id))
      .where(inArray(comicGenres.comicId, comicIds));

    for (const item of cgList) {
      if (!comicGenresMap[item.comicId]) comicGenresMap[item.comicId] = [];
      comicGenresMap[item.comicId].push({ id: item.genreId, name: item.genreName });
    }

    const ccList = await db
      .select({ comicId: comicCreators.comicId, creatorName: creators.name })
      .from(comicCreators)
      .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
      .where(inArray(comicCreators.comicId, comicIds));

    for (const item of ccList) {
      if (!comicCreatorsMap[item.comicId]) comicCreatorsMap[item.comicId] = [];
      comicCreatorsMap[item.comicId].push(item.creatorName);
    }
  }

  const enrichedComics = comicList.map((item) => ({
    ...item,
    genres: comicGenresMap[item.id] || [],
    creators: comicCreatorsMap[item.id] || [],
  }));

  return c.json({
    comics: enrichedComics,
    pagination: {
      page,
      limit,
      total: totalRes?.count || 0,
      totalPages: Math.ceil((totalRes?.count || 0) / limit),
    },
  });
});

// POST /v1/admin/comics - Create comic with cover/banner R2 upload
adminComicRoutes.post("/comics", async (c) => {
  try {
    const formData = await c.req.formData();
    const title = formData.get("title")?.toString().trim();
    const synopsis = formData.get("synopsis")?.toString().trim() || "";
    const status = formData.get("status")?.toString().trim() || "ongoing";
    const accessTier = formData.get("accessTier")?.toString().trim() || "free";
    const genreIdsRaw = formData.get("genreIds")?.toString() || "[]";
    const creatorName = formData.get("creator")?.toString().trim() || "";

    const coverFile = formData.get("cover") as File | null;
    const bannerFile = formData.get("banner") as File | null;

    if (!title) {
      return c.json({ error: "Judul komik wajib diisi." }, 400);
    }
    if (!coverFile) {
      return c.json({ error: "Gambar cover komik wajib diunggah." }, 400);
    }

    const slug = slugify(title) + "-" + Date.now().toString().slice(-4);
    const db = createDbClient(c.env.DATABASE_URL);

    // Upload Cover to R2
    const coverBuffer = await coverFile.arrayBuffer();
    const coverExt = coverFile.name.split(".").pop() || "webp";
    const coverKey = `comics/${slug}/cover-${Date.now()}.${coverExt}`;
    const coverUrl = await uploadToR2(c.env as StorageEnv, "media", coverKey, coverBuffer, {
      contentType: coverFile.type || "image/webp",
    });

    // Upload Banner if provided
    let bannerUrl: string | null = null;
    if (bannerFile && bannerFile.size > 0) {
      const bannerBuffer = await bannerFile.arrayBuffer();
      const bannerExt = bannerFile.name.split(".").pop() || "webp";
      const bannerKey = `comics/${slug}/banner-${Date.now()}.${bannerExt}`;
      bannerUrl = await uploadToR2(c.env as StorageEnv, "media", bannerKey, bannerBuffer, {
        contentType: bannerFile.type || "image/webp",
      });
    }

    // Insert Comic DB Record
    const [newComic] = await db
      .insert(comics)
      .values({
        title,
        slug,
        synopsis,
        coverUrl,
        bannerUrl,
        status,
        accessTier,
      })
      .returning();

    // Link Genres
    try {
      const genreIds: string[] = JSON.parse(genreIdsRaw);
      if (Array.isArray(genreIds) && genreIds.length > 0) {
        await db.insert(comicGenres).values(
          genreIds.map((gId) => ({ comicId: newComic.id, genreId: gId }))
        );
      }
    } catch (e) {
      console.error("[Admin API] Failed to parse/link comic genres:", e);
    }

    // Link Creator
    if (creatorName) {
      const creatorSlug = slugify(creatorName);
      let [existingCreator] = await db
        .select()
        .from(creators)
        .where(eq(creators.slug, creatorSlug));

      if (!existingCreator) {
        [existingCreator] = await db
          .insert(creators)
          .values({ name: creatorName, slug: creatorSlug })
          .returning();
      }

      if (existingCreator) {
        await db.insert(comicCreators).values({
          comicId: newComic.id,
          creatorId: existingCreator.id,
          role: "author",
        });
      }
    }

    return c.json({ success: true, comic: newComic });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal menambahkan komik baru." }, 500);
  }
});

// GET /v1/admin/comics/:id - Get single comic details
adminComicRoutes.get("/comics/:id", async (c) => {
  const comicId = c.req.param("id");
  const db = createDbClient(c.env.DATABASE_URL);

  const [comic] = await db.select().from(comics).where(eq(comics.id, comicId));
  if (!comic) {
    return c.json({ error: "Komik tidak ditemukan." }, 404);
  }

  const linkedGenres = await db
    .select({ id: genres.id, name: genres.name, slug: genres.slug })
    .from(comicGenres)
    .innerJoin(genres, eq(comicGenres.genreId, genres.id))
    .where(eq(comicGenres.comicId, comicId));

  const linkedCreators = await db
    .select({ id: creators.id, name: creators.name, role: comicCreators.role })
    .from(comicCreators)
    .innerJoin(creators, eq(comicCreators.creatorId, creators.id))
    .where(eq(comicCreators.comicId, comicId));

  return c.json({
    comic,
    genres: linkedGenres,
    creators: linkedCreators,
  });
});

// PUT /v1/admin/comics/:id - Update comic
adminComicRoutes.put("/comics/:id", async (c) => {
  try {
    const comicId = c.req.param("id");
    const db = createDbClient(c.env.DATABASE_URL);

    const [existingComic] = await db.select().from(comics).where(eq(comics.id, comicId));
    if (!existingComic) {
      return c.json({ error: "Komik tidak ditemukan." }, 404);
    }

    const formData = await c.req.formData();
    const title = formData.get("title")?.toString().trim();
    const synopsis = formData.get("synopsis")?.toString().trim();
    const status = formData.get("status")?.toString().trim();
    const accessTier = formData.get("accessTier")?.toString().trim();
    const genreIdsRaw = formData.get("genreIds")?.toString();
    const creatorName = formData.get("creator")?.toString().trim();

    const coverFile = formData.get("cover") as File | null;
    const bannerFile = formData.get("banner") as File | null;

    const updateData: Partial<typeof comics.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title) {
      updateData.title = title;
    }
    if (synopsis !== undefined) updateData.synopsis = synopsis;
    if (status) updateData.status = status;
    if (accessTier) updateData.accessTier = accessTier;

    // Re-upload cover if new file attached
    if (coverFile && coverFile.size > 0) {
      const coverBuffer = await coverFile.arrayBuffer();
      const coverExt = coverFile.name.split(".").pop() || "webp";
      const coverKey = `comics/${existingComic.slug}/cover-${Date.now()}.${coverExt}`;
      updateData.coverUrl = await uploadToR2(c.env as StorageEnv, "media", coverKey, coverBuffer, {
        contentType: coverFile.type || "image/webp",
      });
    }

    // Re-upload banner if new file attached
    if (bannerFile && bannerFile.size > 0) {
      const bannerBuffer = await bannerFile.arrayBuffer();
      const bannerExt = bannerFile.name.split(".").pop() || "webp";
      const bannerKey = `comics/${existingComic.slug}/banner-${Date.now()}.${bannerExt}`;
      updateData.bannerUrl = await uploadToR2(c.env as StorageEnv, "media", bannerKey, bannerBuffer, {
        contentType: bannerFile.type || "image/webp",
      });
    }

    const [updatedComic] = await db
      .update(comics)
      .set(updateData)
      .where(eq(comics.id, comicId))
      .returning();

    // Sync Genres
    if (genreIdsRaw !== undefined) {
      try {
        const genreIds: string[] = JSON.parse(genreIdsRaw);
        await db.delete(comicGenres).where(eq(comicGenres.comicId, comicId));
        if (Array.isArray(genreIds) && genreIds.length > 0) {
          await db.insert(comicGenres).values(
            genreIds.map((gId) => ({ comicId, genreId: gId }))
          );
        }
      } catch (e) {
        console.error("[Admin API] Failed to update comic genres:", e);
      }
    }

    // Sync Creator
    if (creatorName !== undefined && creatorName.length > 0) {
      const creatorSlug = slugify(creatorName);
      let [existingCreator] = await db
        .select()
        .from(creators)
        .where(eq(creators.slug, creatorSlug));

      if (!existingCreator) {
        [existingCreator] = await db
          .insert(creators)
          .values({ name: creatorName, slug: creatorSlug })
          .returning();
      }

      await db.delete(comicCreators).where(eq(comicCreators.comicId, comicId));
      if (existingCreator) {
        await db.insert(comicCreators).values({
          comicId,
          creatorId: existingCreator.id,
          role: "author",
        });
      }
    }

    return c.json({ success: true, comic: updatedComic });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal mengedit data komik." }, 500);
  }
});

// DELETE /v1/admin/comics/:id - Delete comic
adminComicRoutes.delete("/comics/:id", async (c) => {
  try {
    const comicId = c.req.param("id");
    const db = createDbClient(c.env.DATABASE_URL);

    const [existingComic] = await db.select().from(comics).where(eq(comics.id, comicId));
    if (!existingComic) {
      return c.json({ error: "Komik tidak ditemukan." }, 404);
    }

    await db.delete(comics).where(eq(comics.id, comicId));
    return c.json({ success: true, message: `Komik "${existingComic.title}" berhasil dihapus.` });
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal menghapus komik." }, 500);
  }
});
