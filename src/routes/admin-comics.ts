import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { ComicService } from "@/services/comic.service";
import { successResponse, errorResponse } from "@/utils/response";

export const adminComicRoutes = new Hono<AppEnv>();

adminComicRoutes.use("*", requireAdmin());

// GET /v1/admin/comics - List comics with pagination, search, status filter
adminComicRoutes.get("/comics", async (c) => {
  try {
    const q = c.req.query("q") || "";
    const status = c.req.query("status") || "";
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "15", 10);

    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const result = await service.getComicsList({ q, status, page, limit });

    return successResponse(c, result);
  } catch (err: any) {
    console.error("[Admin API] Failed to list comics:", err);
    return c.json(
      {
        error: err.message || "Failed to fetch comic catalog from database.",
        comics: [],
        pagination: { page: 1, limit: 15, total: 0, totalPages: 1 },
      },
      500
    );
  }
});

// POST /v1/admin/comics - Create comic with cover/banner R2 upload
adminComicRoutes.post("/comics", async (c) => {
  try {
    const formData = await c.req.formData();
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const comic = await service.createComic({
      title: formData.get("title")?.toString().trim() || "",
      synopsis: formData.get("synopsis")?.toString().trim() || "",
      type: formData.get("type")?.toString().trim() || "manga",
      status: formData.get("status")?.toString().trim() || "ongoing",
      accessTier: formData.get("accessTier")?.toString().trim() || "free",
      alternateTitles: formData.getAll("alternateTitles").map((value) => value.toString().trim()).filter(Boolean),
      genreIdsRaw: formData.get("genreIds")?.toString(),
      creatorName: formData.get("creator")?.toString().trim(),
      coverFile: formData.get("cover") as File | null,
      coverUrlSource: formData.get("coverUrlSource")?.toString().trim() || null,
      bannerFile: formData.get("banner") as File | null,
      bannerUrlSource: formData.get("bannerUrlSource")?.toString().trim() || null,
    });

    return successResponse(c, { success: true, comic }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to add new comic.", 400);
  }
});

// GET /v1/admin/comics/:id - Get single comic details
adminComicRoutes.get("/comics/:id", async (c) => {
  try {
    const comicId = c.req.param("id");
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const comicData = await service.getComicById(comicId);
    return successResponse(c, comicData);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to load comic details.", 404);
  }
});

// PUT /v1/admin/comics/:id - Update comic
adminComicRoutes.put("/comics/:id", async (c) => {
  try {
    const comicId = c.req.param("id");
    const formData = await c.req.formData();
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const updatedComic = await service.updateComic(comicId, {
      title: formData.get("title")?.toString().trim(),
      synopsis: formData.get("synopsis")?.toString().trim(),
      type: formData.get("type")?.toString().trim(),
      status: formData.get("status")?.toString().trim(),
      accessTier: formData.get("accessTier")?.toString().trim(),
      ...(formData.has("alternateTitles")
        ? { alternateTitles: formData.getAll("alternateTitles").map((value) => value.toString().trim()).filter(Boolean) }
        : {}),
      genreIdsRaw: formData.get("genreIds")?.toString(),
      creatorName: formData.get("creator")?.toString().trim(),
      coverFile: formData.get("cover") as File | null,
      coverUrlSource: formData.get("coverUrlSource")?.toString().trim() || null,
      bannerFile: formData.get("banner") as File | null,
      bannerUrlSource: formData.get("bannerUrlSource")?.toString().trim() || null,
    });

    return successResponse(c, { success: true, comic: updatedComic });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to update comic.", 400);
  }
});

// DELETE /v1/admin/comics/:id - Delete comic
adminComicRoutes.delete("/comics/:id", async (c) => {
  try {
    const comicId = c.req.param("id");
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const title = await service.deleteComic(comicId);
    return successResponse(c, { success: true, message: `Comic "${title}" deleted successfully.` });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete comic.", 400);
  }
});
