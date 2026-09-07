import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { ChapterService } from "@/services/chapter.service";
import { successResponse, errorResponse } from "@/utils/response";

export const adminStorageRoutes = new Hono<AppEnv>();

adminStorageRoutes.use("*", requireAdmin());

// POST /v1/admin/storage/purge-orphans - Hapus file gambar orphan di R2 yang tidak terdaftar di DB
adminStorageRoutes.post("/storage/purge-orphans", async (c) => {
  try {
    const service = new ChapterService(c.env.DATABASE_URL, c.env);
    const result = await service.purgeOrphanImages();

    return successResponse(c, {
      success: true,
      message: `Pembersihan berhasil! ${result.purgedCount} file sampah (${result.totalSizeMB} MB) dihapus dari R2.`,
      ...result,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal membersihkan file gambar sampah.", 500);
  }
});
