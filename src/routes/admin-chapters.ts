import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { ChapterService } from "@/services/chapter.service";
import { successResponse, errorResponse } from "@/utils/response";

export const adminChapterRoutes = new Hono<AppEnv>();

adminChapterRoutes.use("*", requireAdmin());

// GET /v1/admin/comics/:comicId/chapters - List chapters for comic
adminChapterRoutes.get("/comics/:comicId/chapters", async (c) => {
  try {
    const comicId = c.req.param("comicId");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const chapterList = await service.getChaptersByComicId(comicId);
    return successResponse(c, { chapters: chapterList });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal mengambil daftar chapter.", 500);
  }
});

// POST /v1/admin/comics/:comicId/chapters - Create chapter with multi-page images
adminChapterRoutes.post("/comics/:comicId/chapters", async (c) => {
  try {
    const comicId = c.req.param("comicId");
    const formData = await c.req.formData();
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const chapterNumberStr = formData.get("chapterNumber")?.toString().trim();
    const title = formData.get("title")?.toString().trim() || "";
    const accessTier = formData.get("accessTier")?.toString().trim() || "free";
    const isEarlyAccess = formData.get("isEarlyAccess")?.toString() === "true";

    const pageFiles = formData.getAll("pages") as File[];
    const validPages = pageFiles.filter((f) => f && typeof f === "object" && f.size > 0);

    const result = await service.createChapter({
      comicId,
      chapterNumberStr,
      title,
      accessTier,
      isEarlyAccess,
      validPages,
    });

    return successResponse(c, { success: true, ...result }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal membuat chapter baru.", 400);
  }
});

// GET /v1/admin/comics/:comicId/chapters/:id - Get chapter detail + pages
adminChapterRoutes.get("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const chapterId = c.req.param("id");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const result = await service.getChapterById(chapterId);
    return successResponse(c, result);
  } catch (err: any) {
    return errorResponse(c, err.message || "Chapter tidak ditemukan.", 404);
  }
});

// PUT /v1/admin/comics/:comicId/chapters/:id - Update chapter metadata
adminChapterRoutes.put("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const chapterId = c.req.param("id");
    const body = await c.req.json();
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const updated = await service.updateChapter(chapterId, body);
    return successResponse(c, { success: true, chapter: updated });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal memperbarui metadata chapter.", 400);
  }
});

// DELETE /v1/admin/comics/:comicId/chapters/:id - Delete chapter
adminChapterRoutes.delete("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const comicId = c.req.param("comicId");
    const chapterId = c.req.param("id");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const chNum = await service.deleteChapter(comicId, chapterId);
    return successResponse(c, { success: true, message: `Chapter ${chNum} berhasil dihapus.` });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal menghapus chapter.", 400);
  }
});
