import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { GenreService } from "@/services/genre.service";
import { successResponse, errorResponse } from "@/utils/response";

export const adminGenreRoutes = new Hono<AppEnv>();

adminGenreRoutes.use("*", requireAdmin());

// GET /v1/admin/genres - List all genres
adminGenreRoutes.get("/genres", async (c) => {
  try {
    const service = new GenreService(c.env.DATABASE_URL);
    const genreList = await service.getAllGenres();
    return successResponse(c, { genres: genreList });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal mengambil daftar genre.", 500);
  }
});

// POST /v1/admin/genres - Create genre
adminGenreRoutes.post("/genres", async (c) => {
  try {
    const body = await c.req.json();
    const service = new GenreService(c.env.DATABASE_URL);

    const newGenre = await service.createGenre(body);
    return successResponse(c, { success: true, genre: newGenre }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal membuat genre.", 400);
  }
});

// PUT /v1/admin/genres/:id - Update genre
adminGenreRoutes.put("/genres/:id", async (c) => {
  try {
    const genreId = c.req.param("id");
    const body = await c.req.json();
    const service = new GenreService(c.env.DATABASE_URL);

    const updated = await service.updateGenre(genreId, body);
    return successResponse(c, { success: true, genre: updated });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal memperbarui genre.", 400);
  }
});

// DELETE /v1/admin/genres/:id - Delete genre
adminGenreRoutes.delete("/genres/:id", async (c) => {
  try {
    const genreId = c.req.param("id");
    const service = new GenreService(c.env.DATABASE_URL);

    const name = await service.deleteGenre(genreId);
    return successResponse(c, { success: true, message: `Genre "${name}" berhasil dihapus.` });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal menghapus genre.", 400);
  }
});
