import { Hono } from "hono"
import type { AppEnv } from "@/middleware/auth"
import { GenreService } from "@/services/genre.service"
import type { Genre } from "@/db/schema/genres"
import { successResponse, errorResponse } from "@/utils/response"

type GenreLoader = (databaseUrl: string) => Promise<Genre[]>

export function createGenreRoutes(
  loadGenres: GenreLoader = (databaseUrl) =>
    new GenreService(databaseUrl).getAllGenres()
) {
  const routes = new Hono<AppEnv>()

  // GET /v1/genres - Public route to fetch all genres
  routes.get("/", async (c) => {
    try {
      const genreList = await loadGenres(c.env.DATABASE_URL)
      return successResponse(c, { genres: genreList })
    } catch (err: any) {
      console.error("[Public API] Failed to fetch genres:", err)
      return errorResponse(c, err.message || "Failed to fetch genres.", 500)
    }
  })

  return routes
}

export const genreRoutes = createGenreRoutes()
