import { Hono } from "hono"
import type { AppEnv } from "@/middleware/auth"
import { requireAdmin } from "@/middleware/admin"
import { ChapterService } from "@/services/chapter.service"
import { successResponse, errorResponse } from "@/utils/response"

export const adminChapterRoutes = new Hono<AppEnv>()

adminChapterRoutes.use("*", requireAdmin())

// GET /v1/admin/comics/:comicId/chapters - List chapters for comic
adminChapterRoutes.get("/comics/:comicId/chapters", async (c) => {
  try {
    const comicId = c.req.param("comicId")
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const chapterList = await service.getChaptersByComicId(comicId)
    return successResponse(c, { chapters: chapterList })
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch chapter list.", 500)
  }
})

// POST /v1/admin/comics/:comicId/chapters/init - Initialize new chapter
adminChapterRoutes.post("/comics/:comicId/chapters/init", async (c) => {
  try {
    const comicId = c.req.param("comicId")
    const body = await c.req.json()
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const result = await service.initChapter({
      comicId,
      chapterNumberStr: body.chapterNumber?.toString().trim(),
      title: body.title?.toString().trim(),
      accessTier: body.accessTier?.toString().trim() || "free",
      isEarlyAccess: Boolean(body.isEarlyAccess),
      totalPages: Number(body.totalPages) || 0,
    })

    return successResponse(c, { success: true, ...result }, 201)
  } catch (err: any) {
    return errorResponse(
      c,
      err.message || "Failed to initialize new chapter.",
      400
    )
  }
})

// POST /v1/admin/comics/:comicId/chapters/:id/pages/upload - Upload single page image
adminChapterRoutes.post(
  "/comics/:comicId/chapters/:id/pages/upload",
  async (c) => {
    try {
      const chapterId = c.req.param("id")
      const formData = await c.req.formData()
      const service = new ChapterService(c.env.DATABASE_URL, c.env)

      const pageNumber = Number(formData.get("pageNumber")) || 1
      const file = formData.get("file") as File
      const width = Number(formData.get("width"))
      const height = Number(formData.get("height"))

      if (!file || typeof file !== "object" || file.size === 0) {
        return errorResponse(c, "Invalid page image file.", 400)
      }

      const pageRecord = await service.uploadSinglePage(
        chapterId,
        pageNumber,
        file,
        Number.isInteger(width) && width > 0 ? width : undefined,
        Number.isInteger(height) && height > 0 ? height : undefined
      )
      return successResponse(c, { success: true, page: pageRecord }, 201)
    } catch (err: any) {
      return errorResponse(
        c,
        err.message || "Failed to upload page image.",
        400
      )
    }
  }
)

// POST /v1/admin/comics/:comicId/chapters/:id/finalize - Finalize chapter total pages
adminChapterRoutes.post("/comics/:comicId/chapters/:id/finalize", async (c) => {
  try {
    const comicId = c.req.param("comicId")
    const chapterId = c.req.param("id")
    const body = await c.req.json()
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const totalPages = Number(body.totalPages) || 0
    const updated = await service.finalizeChapter(
      comicId,
      chapterId,
      totalPages
    )

    return successResponse(c, { success: true, chapter: updated })
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to finalize chapter.", 400)
  }
})

// POST /v1/admin/comics/:comicId/chapters - Legacy single-request multi-page upload
adminChapterRoutes.post("/comics/:comicId/chapters", async (c) => {
  try {
    const comicId = c.req.param("comicId")
    const formData = await c.req.formData()
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const chapterNumberStr = formData.get("chapterNumber")?.toString().trim()
    const title = formData.get("title")?.toString().trim() || ""
    const accessTier = formData.get("accessTier")?.toString().trim() || "free"
    const isEarlyAccess = formData.get("isEarlyAccess")?.toString() === "true"

    const pageFiles = formData.getAll("pages") as File[]
    const validPages = pageFiles.filter(
      (f) => f && typeof f === "object" && f.size > 0
    )

    const result = await service.createChapter({
      comicId,
      chapterNumberStr,
      title,
      accessTier,
      isEarlyAccess,
      validPages,
    })

    return successResponse(c, { success: true, ...result }, 201)
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to create new chapter.", 400)
  }
})

// GET /v1/admin/comics/:comicId/chapters/:id - Get chapter detail + pages
adminChapterRoutes.get("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const chapterId = c.req.param("id")
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const result = await service.getChapterById(chapterId)
    return successResponse(c, result)
  } catch (err: any) {
    return errorResponse(c, err.message || "Chapter not found.", 404)
  }
})

// PUT /v1/admin/comics/:comicId/chapters/:id - Update chapter metadata
adminChapterRoutes.put("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const chapterId = c.req.param("id")
    const body = await c.req.json()
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const updated = await service.updateChapter(chapterId, body)
    return successResponse(c, { success: true, chapter: updated })
  } catch (err: any) {
    return errorResponse(
      c,
      err.message || "Failed to update chapter metadata.",
      400
    )
  }
})

// DELETE /v1/admin/comics/:comicId/chapters/:id - Delete chapter
adminChapterRoutes.delete("/comics/:comicId/chapters/:id", async (c) => {
  try {
    const comicId = c.req.param("comicId")
    const chapterId = c.req.param("id")
    const service = new ChapterService(c.env.DATABASE_URL, c.env)

    const chNum = await service.deleteChapter(comicId, chapterId)
    return successResponse(c, {
      success: true,
      message: `Chapter ${chNum} deleted successfully.`,
    })
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete chapter.", 400)
  }
})
