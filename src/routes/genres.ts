import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { GenreService } from "@/services/genre.service";
import type { Genre } from "@/db/schema/genres";
import { successResponse, errorResponse } from "@/utils/response";
import { CommonErrorResponses } from "@/schemas/common";

type GenreLoader = (databaseUrl: string) => Promise<Genre[]>;

const GenreSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi("Genre");

const ListGenresRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Genres"],
  operationId: "listGenres",
  summary: "List comic genres",
  description: "Returns the public comic genre catalog.",
  responses: {
    200: {
      description: "The available genres.",
      content: {
        "application/json": {
          schema: z.object({ genres: z.array(GenreSchema) }),
        },
      },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});

export function createGenreRoutes(
  loadGenres: GenreLoader = (databaseUrl) => new GenreService(databaseUrl).getAllGenres(),
) {
  const routes = new OpenAPIHono<AppEnv>();

  routes.openapi(ListGenresRoute, async (c) => {
    try {
      const genreList = await loadGenres(c.env.DATABASE_URL);
      return successResponse(c, { genres: genreList });
    } catch (err: any) {
      console.error("[Public API] Failed to fetch genres:", err);
      return errorResponse(c, err.message || "Failed to fetch genres.", 500);
    }
  });

  return routes;
}

export const genreRoutes = createGenreRoutes();
