import { Hono } from "hono"
import type { AppEnv } from "@/middleware/auth"
import { requireAdmin } from "@/middleware/admin"
import { ChapterService } from "@/services/chapter.service"
import { successResponse, errorResponse } from "@/utils/response"

export const adminStorageRoutes = new Hono<AppEnv>()

adminStorageRoutes.use("*", requireAdmin())

// POST /v1/admin/storage/purge-orphans - Purge orphan image files in R2 not registered in DB
adminStorageRoutes.post("/storage/purge-orphans", async (c) => {
  try {
    const service = new ChapterService(c.env.DATABASE_URL, c.env)
    const result = await service.purgeOrphanImages()

    return successResponse(c, {
      success: true,
      message: `Cleanup successful! ${result.purgedCount} orphan files (${result.totalSizeMB} MB) deleted from R2.`,
      "purged-count": result.purgedCount,
      "total-size-mb": result.totalSizeMB,
      ...result,
    })
  } catch (err: any) {
    return errorResponse(
      c,
      err.message || "Failed to purge orphan images.",
      500
    )
  }
})
