import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { GenreService } from "@/services/genre.service";
import { successResponse, errorResponse } from "@/utils/response";
import { AdminSecurity, CommonErrorResponses } from "@/schemas/common";

const GenreDataSchema = z.unknown().openapi({ type: "object", description: "Genre data." });
const AdminListGenresRoute = createRoute({
  method: "get",
  path: "/genres",
  tags: ["Administration"],
  operationId: "adminListGenres",
  summary: "List all genres",
  description: "Returns all genres. Requires administrator access.",
  security: AdminSecurity,
  responses: {
    200: {
      description: "The genre catalog.",
      content: { "application/json": { schema: z.object({ genres: z.array(z.unknown()) }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminCreateGenreRoute = createRoute({
  method: "post",
  path: "/genres",
  tags: ["Administration"],
  operationId: "adminCreateGenre",
  summary: "Create a genre",
  description: "Creates a genre. Requires administrator access.",
  security: AdminSecurity,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ name: z.string(), description: z.string().optional() }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "The genre was created.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), genre: GenreDataSchema }) },
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
const AdminUpdateGenreRoute = createRoute({
  method: "put",
  path: "/genres/{id}",
  tags: ["Administration"],
  operationId: "adminUpdateGenre",
  summary: "Update a genre",
  description: "Updates a genre by ID. Requires administrator access.",
  security: AdminSecurity,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ name: z.string().optional(), description: z.string().optional() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The genre was updated.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), genre: GenreDataSchema }) },
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
const AdminDeleteGenreRoute = createRoute({
  method: "delete",
  path: "/genres/{id}",
  tags: ["Administration"],
  operationId: "adminDeleteGenre",
  summary: "Delete a genre",
  description: "Deletes a genre by ID. Requires administrator access.",
  security: AdminSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "The genre was deleted.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), message: z.string() }) },
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

export const adminGenreRoutes = new OpenAPIHono<AppEnv>();

adminGenreRoutes.use("*", requireAdmin);

// GET /v1/admin/genres - List all genres
adminGenreRoutes.openapi(AdminListGenresRoute, async (c) => {
  try {
    const service = new GenreService(c.env.DATABASE_URL);
    const genreList = await service.getAllGenres();
    return successResponse(c, { genres: genreList });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch genres.", 500);
  }
});

// POST /v1/admin/genres - Create genre
adminGenreRoutes.openapi(AdminCreateGenreRoute, async (c) => {
  try {
    const body = c.req.valid("json");
    const service = new GenreService(c.env.DATABASE_URL);

    const newGenre = await service.createGenre(body);
    return successResponse(c, { success: true, genre: newGenre }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to create genre.", 400);
  }
});

// PUT /v1/admin/genres/:id - Update genre
adminGenreRoutes.openapi(AdminUpdateGenreRoute, async (c) => {
  try {
    const { id: genreId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new GenreService(c.env.DATABASE_URL);

    const updated = await service.updateGenre(genreId, body);
    return successResponse(c, { success: true, genre: updated });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to update genre.", 400);
  }
});

// DELETE /v1/admin/genres/:id - Delete genre
adminGenreRoutes.openapi(AdminDeleteGenreRoute, async (c) => {
  try {
    const { id: genreId } = c.req.valid("param");
    const service = new GenreService(c.env.DATABASE_URL);

    const name = await service.deleteGenre(genreId);
    return successResponse(c, {
      success: true,
      message: `Genre "${name}" deleted successfully.`,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete genre.", 400);
  }
});
