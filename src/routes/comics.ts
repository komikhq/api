import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { ComicService } from "@/services/comic.service";
import { ChapterService } from "@/services/chapter.service";
import { successResponse, errorResponse } from "@/utils/response";

export const comicRoutes = new Hono<AppEnv>();

// GET /v1/comics/trending - Get trending / featured comics from database
comicRoutes.get("/trending", async (c) => {
  try {
    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const result = await service.getComicsList({ page: 1, limit: 10 });
    return successResponse(c, {
      comics: result.comics,
      total: result.pagination.total,
    });
  } catch (err: any) {
    console.error("[Public API] Failed to fetch trending comics:", err);
    return successResponse(c, { comics: [], total: 0 });
  }
});

// GET /v1/comics/browse - Browse & search comics with filters
comicRoutes.get("/browse", async (c) => {
  try {
    const search = c.req.query("search") || c.req.query("q") || "";
    const genre = c.req.query("genre") || "";
    const status = c.req.query("status") || "";
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "20", 10);

    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const result = await service.getComicsList({ q: search, genre, status, page, limit });

    return successResponse(c, {
      query: { search, genre, status },
      comics: result.comics,
      pagination: result.pagination,
    });
  } catch (err: any) {
    console.error("[Public API] Failed to fetch browse comics:", err);
    return successResponse(c, {
      query: {},
      comics: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });
  }
});

// GET /v1/comics/:slug/chapters/:chapterSlug - Public chapter detail & reader pages
comicRoutes.get("/:slug/chapters/:chapterSlug", async (c) => {
  try {
    const comicSlug = c.req.param("slug");
    const chapterSlug = c.req.param("chapterSlug");

    const chapterService = new ChapterService(c.env.DATABASE_URL, c.env);
    const data = await chapterService.getPublicChapterBySlugs(comicSlug, chapterSlug);

    return successResponse(c, data);
  } catch (err: any) {
    return errorResponse(c, err.message || "Chapter tidak ditemukan.", 404);
  }
});

// GET /v1/comics/:slug - Get single comic details by slug
comicRoutes.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const comicData = await service.getComicBySlug(slug);

    return successResponse(c, comicData);
  } catch (err: any) {
    return errorResponse(c, err.message || "Komik tidak ditemukan.", 404);
  }
});


