import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { ComicService } from "@/services/comic.service";
import { successResponse, errorResponse } from "@/utils/response";
import { AdminSecurity, CommonErrorResponses } from "@/schemas/common";

const ComicDataSchema = z.unknown().openapi({ type: "object", description: "Comic data." });
const ComicListRoute = createRoute({
  method: "get",
  path: "/comics",
  tags: ["Administration"],
  operationId: "adminListComics",
  summary: "List comics",
  description:
    "Lists comics with search, status filtering, and pagination. Requires administrator access.",
  security: AdminSecurity,
  request: {
    query: z.object({
      q: z.string().optional(),
      status: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "The matching comics and pagination data.",
      content: { "application/json": { schema: ComicDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const ComicFormSchema = z
  .object({
    title: z.string().optional(),
    synopsis: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    accessTier: z.string().optional(),
    alternateTitles: z.union([z.string(), z.array(z.string())]).optional(),
    genreIds: z.string().optional(),
    creator: z.string().optional(),
    cover: z.file().optional().openapi({ type: "string", format: "binary" }),
    coverUrlSource: z.string().optional(),
    banner: z.file().optional().openapi({ type: "string", format: "binary" }),
    bannerUrlSource: z.string().optional(),
  })
  .passthrough();
const CreateComicRoute = createRoute({
  method: "post",
  path: "/comics",
  tags: ["Administration"],
  operationId: "adminCreateComic",
  summary: "Create a comic",
  description:
    "Creates a comic and optionally uploads cover and banner images. Requires administrator access.",
  security: AdminSecurity,
  request: { body: { content: { "multipart/form-data": { schema: ComicFormSchema } } } },
  responses: {
    201: {
      description: "The comic was created.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), comic: ComicDataSchema }) },
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
const GetComicAdminRoute = createRoute({
  method: "get",
  path: "/comics/{id}",
  tags: ["Administration"],
  operationId: "adminGetComic",
  summary: "Get comic details",
  description: "Gets comic details by ID. Requires administrator access.",
  security: AdminSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "The comic and its details.",
      content: { "application/json": { schema: ComicDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const UpdateComicRoute = createRoute({
  method: "put",
  path: "/comics/{id}",
  tags: ["Administration"],
  operationId: "adminUpdateComic",
  summary: "Update a comic",
  description:
    "Updates comic details and optional cover/banner images. Requires administrator access.",
  security: AdminSecurity,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "multipart/form-data": { schema: ComicFormSchema } } },
  },
  responses: {
    200: {
      description: "The comic was updated.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), comic: ComicDataSchema }) },
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
const DeleteComicRoute = createRoute({
  method: "delete",
  path: "/comics/{id}",
  tags: ["Administration"],
  operationId: "adminDeleteComic",
  summary: "Delete a comic",
  description: "Deletes a comic. Requires administrator access.",
  security: AdminSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "The comic was deleted.",
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

export const adminComicRoutes = new OpenAPIHono<AppEnv>();

adminComicRoutes.use("*", requireAdmin);

// GET /v1/admin/comics - List comics with pagination, search, status filter
adminComicRoutes.openapi(ComicListRoute, async (c) => {
  try {
    const params = c.req.valid("query");
    const q = params.q || "";
    const status = params.status || "";
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "15", 10);

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
      500,
    );
  }
});

// POST /v1/admin/comics - Create comic with cover/banner R2 upload
adminComicRoutes.openapi(CreateComicRoute, async (c) => {
  try {
    const formData = await c.req.formData();
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const comic = await service.createComic({
      title: formData.get("title")?.toString().trim() || "",
      synopsis: formData.get("synopsis")?.toString().trim() || "",
      type: formData.get("type")?.toString().trim() || "manga",
      status: formData.get("status")?.toString().trim() || "ongoing",
      accessTier: formData.get("accessTier")?.toString().trim() || "free",
      alternateTitles: formData
        .getAll("alternateTitles")
        .map((value) => value.toString().trim())
        .filter(Boolean),
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
adminComicRoutes.openapi(GetComicAdminRoute, async (c) => {
  try {
    const { id: comicId } = c.req.valid("param");
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const comicData = await service.getComicById(comicId);
    return successResponse(c, comicData);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to load comic details.", 404);
  }
});

// PUT /v1/admin/comics/:id - Update comic
adminComicRoutes.openapi(UpdateComicRoute, async (c) => {
  try {
    const { id: comicId } = c.req.valid("param");
    const formData = await c.req.formData();
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const updatedComic = await service.updateComic(comicId, {
      title: formData.get("title")?.toString().trim(),
      synopsis: formData.get("synopsis")?.toString().trim(),
      type: formData.get("type")?.toString().trim(),
      status: formData.get("status")?.toString().trim(),
      accessTier: formData.get("accessTier")?.toString().trim(),
      ...(formData.has("alternateTitles")
        ? {
            alternateTitles: formData
              .getAll("alternateTitles")
              .map((value) => value.toString().trim())
              .filter(Boolean),
          }
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
adminComicRoutes.openapi(DeleteComicRoute, async (c) => {
  try {
    const { id: comicId } = c.req.valid("param");
    const service = new ComicService(c.env.DATABASE_URL, c.env);

    const title = await service.deleteComic(comicId);
    return successResponse(c, {
      success: true,
      message: `Comic "${title}" deleted successfully.`,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete comic.", 400);
  }
});
