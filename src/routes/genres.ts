import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { GenreService } from "@/services/genre.service";
import { successResponse, errorResponse } from "@/utils/response";

export const genreRoutes = new Hono<AppEnv>();

// GET /v1/genres - Public route to fetch all genres
genreRoutes.get("/", async (c) => {
  try {
    const service = new GenreService(c.env.DATABASE_URL);
    const genreList = await service.getAllGenres();
    return successResponse(c, { genres: genreList });
  } catch (err: any) {
    console.error("[Public API] Failed to fetch genres:", err);
    return errorResponse(c, err.message || "Gagal mengambil daftar genre.", 500);
  }
});
