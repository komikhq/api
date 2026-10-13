import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { ChapterService } from "@/services/chapter.service";
import { successResponse, errorResponse } from "@/utils/response";
import { AdminSecurity, CommonErrorResponses } from "@/schemas/common";

const ChapterDataSchema = z.unknown().openapi({ type: "object", description: "Chapter data." });
const ComicChapterParams = z.object({ comicId: z.string() });
const ChapterParams = z.object({ comicId: z.string(), id: z.string() });
const ChapterInitBody = z.object({
  chapterNumber: z.union([z.string(), z.number()]),
  title: z.string().optional(),
  accessTier: z.string().optional(),
  isEarlyAccess: z.boolean().optional(),
  totalPages: z.number().int().optional(),
});
const ChapterFinalizeBody = z.object({ totalPages: z.number().int() });
const ChapterResponses = {
  400: CommonErrorResponses[400],
  401: CommonErrorResponses[401],
  403: CommonErrorResponses[403],
  404: CommonErrorResponses[404],
  409: CommonErrorResponses[409],
  500: CommonErrorResponses[500],
};
const ListChaptersRoute = createRoute({
  method: "get",
  path: "/comics/{comicId}/chapters",
  tags: ["Administration"],
  operationId: "adminListChapters",
  summary: "List comic chapters",
  description: "Lists chapters for a comic. Requires administrator access.",
  security: AdminSecurity,
  request: { params: ComicChapterParams },
  responses: {
    200: {
      description: "The comic's chapters.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const InitializeChapterRoute = createRoute({
  method: "post",
  path: "/comics/{comicId}/chapters/init",
  tags: ["Administration"],
  operationId: "adminInitializeChapter",
  summary: "Initialize a chapter upload",
  description: "Creates chapter metadata before pages are uploaded.",
  security: AdminSecurity,
  request: {
    params: ComicChapterParams,
    body: { content: { "application/json": { schema: ChapterInitBody } } },
  },
  responses: {
    201: {
      description: "The chapter upload was initialized.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const UploadChapterPageRoute = createRoute({
  method: "post",
  path: "/comics/{comicId}/chapters/{id}/pages/upload",
  tags: ["Administration"],
  operationId: "adminUploadChapterPage",
  summary: "Upload a chapter page",
  description: "Uploads a single page image for a chapter.",
  security: AdminSecurity,
  request: {
    params: ChapterParams,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            pageNumber: z.number().int().optional(),
            file: z.file().openapi({ type: "string", format: "binary" }),
            width: z.number().int().optional(),
            height: z.number().int().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "The page was uploaded.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const FinalizeChapterRoute = createRoute({
  method: "post",
  path: "/comics/{comicId}/chapters/{id}/finalize",
  tags: ["Administration"],
  operationId: "adminFinalizeChapter",
  summary: "Finalize a chapter",
  description: "Sets the final page count for a chapter.",
  security: AdminSecurity,
  request: {
    params: ChapterParams,
    body: { content: { "application/json": { schema: ChapterFinalizeBody } } },
  },
  responses: {
    200: {
      description: "The chapter was finalized.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const CreateChapterRoute = createRoute({
  method: "post",
  path: "/comics/{comicId}/chapters",
  tags: ["Administration"],
  operationId: "adminCreateChapter",
  summary: "Create a chapter with pages",
  description: "Creates a chapter and uploads its pages in one request.",
  security: AdminSecurity,
  request: {
    params: ComicChapterParams,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            chapterNumber: z.string(),
            title: z.string().optional(),
            accessTier: z.string().optional(),
            isEarlyAccess: z.boolean().optional(),
            pages: z
              .array(z.file())
              .openapi({ type: "array", items: { type: "string", format: "binary" } }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "The chapter and pages were created.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const GetChapterRoute = createRoute({
  method: "get",
  path: "/comics/{comicId}/chapters/{id}",
  tags: ["Administration"],
  operationId: "adminGetChapter",
  summary: "Get chapter details",
  description: "Gets chapter metadata and pages by ID.",
  security: AdminSecurity,
  request: { params: ChapterParams },
  responses: {
    200: {
      description: "The chapter and its pages.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const UpdateChapterRoute = createRoute({
  method: "put",
  path: "/comics/{comicId}/chapters/{id}",
  tags: ["Administration"],
  operationId: "adminUpdateChapter",
  summary: "Update chapter metadata",
  description: "Updates chapter metadata by ID.",
  security: AdminSecurity,
  request: {
    params: ChapterParams,
    body: { content: { "application/json": { schema: z.object({}).passthrough() } } },
  },
  responses: {
    200: {
      description: "The chapter was updated.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});
const DeleteChapterRoute = createRoute({
  method: "delete",
  path: "/comics/{comicId}/chapters/{id}",
  tags: ["Administration"],
  operationId: "adminDeleteChapter",
  summary: "Delete a chapter",
  description: "Deletes a chapter and its associated pages.",
  security: AdminSecurity,
  request: { params: ChapterParams },
  responses: {
    200: {
      description: "The chapter was deleted.",
      content: { "application/json": { schema: ChapterDataSchema } },
    },
    ...ChapterResponses,
  },
});

export const adminChapterRoutes = new OpenAPIHono<AppEnv>();

adminChapterRoutes.use("*", requireAdmin);

// GET /v1/admin/comics/:comicId/chapters - List chapters for comic
adminChapterRoutes.openapi(ListChaptersRoute, async (c) => {
  try {
    const { comicId } = c.req.valid("param");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const chapterList = await service.getChaptersByComicId(comicId);
    return successResponse(c, { chapters: chapterList });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch chapter list.", 500);
  }
});

// POST /v1/admin/comics/:comicId/chapters/init - Initialize new chapter
adminChapterRoutes.openapi(InitializeChapterRoute, async (c) => {
  try {
    const { comicId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const result = await service.initChapter({
      comicId,
      chapterNumberStr: body.chapterNumber?.toString().trim(),
      title: body.title?.toString().trim(),
      accessTier: body.accessTier?.toString().trim() || "free",
      isEarlyAccess: Boolean(body.isEarlyAccess),
      totalPages: Number(body.totalPages) || 0,
    });

    return successResponse(c, { success: true, ...result }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to initialize new chapter.", 400);
  }
});

// POST /v1/admin/comics/:comicId/chapters/:id/pages/upload - Upload single page image
adminChapterRoutes.openapi(UploadChapterPageRoute, async (c) => {
  try {
    const { id: chapterId } = c.req.valid("param");
    const formData = await c.req.formData();
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const pageNumber = Number(formData.get("pageNumber")) || 1;
    const file = formData.get("file") as File;
    const width = Number(formData.get("width"));
    const height = Number(formData.get("height"));

    if (!file || typeof file !== "object" || file.size === 0) {
      return errorResponse(c, "Invalid page image file.", 400);
    }

    const pageRecord = await service.uploadSinglePage(
      chapterId,
      pageNumber,
      file,
      Number.isInteger(width) && width > 0 ? width : undefined,
      Number.isInteger(height) && height > 0 ? height : undefined,
    );
    return successResponse(c, { success: true, page: pageRecord }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to upload page image.", 400);
  }
});

// POST /v1/admin/comics/:comicId/chapters/:id/finalize - Finalize chapter total pages
adminChapterRoutes.openapi(FinalizeChapterRoute, async (c) => {
  try {
    const { comicId, id: chapterId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const totalPages = Number(body.totalPages) || 0;
    const updated = await service.finalizeChapter(comicId, chapterId, totalPages);

    return successResponse(c, { success: true, chapter: updated });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to finalize chapter.", 400);
  }
});

// POST /v1/admin/comics/:comicId/chapters - Legacy single-request multi-page upload
adminChapterRoutes.openapi(CreateChapterRoute, async (c) => {
  try {
    const { comicId } = c.req.valid("param");
    const formData = await c.req.formData();
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const chapterNumberStr = formData.get("chapterNumber")?.toString().trim();
    const title = formData.get("title")?.toString().trim() || "";
    const accessTier = formData.get("accessTier")?.toString().trim() || "free";
    const isEarlyAccess = formData.get("isEarlyAccess")?.toString() === "true";

    const pageFiles = formData.getAll("pages") as File[];
    const validPages = pageFiles.filter((f) => f && typeof f === "object" && f.size > 0);

    const result = await service.createChapter({
      comicId,
      chapterNumberStr,
      title,
      accessTier,
      isEarlyAccess,
      validPages,
    });

    return successResponse(c, { success: true, ...result }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to create new chapter.", 400);
  }
});

// GET /v1/admin/comics/:comicId/chapters/:id - Get chapter detail + pages
adminChapterRoutes.openapi(GetChapterRoute, async (c) => {
  try {
    const { id: chapterId } = c.req.valid("param");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const result = await service.getChapterById(chapterId);
    return successResponse(c, result);
  } catch (err: any) {
    return errorResponse(c, err.message || "Chapter not found.", 404);
  }
});

// PUT /v1/admin/comics/:comicId/chapters/:id - Update chapter metadata
adminChapterRoutes.openapi(UpdateChapterRoute, async (c) => {
  try {
    const { id: chapterId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const updated = await service.updateChapter(chapterId, body);
    return successResponse(c, { success: true, chapter: updated });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to update chapter metadata.", 400);
  }
});

// DELETE /v1/admin/comics/:comicId/chapters/:id - Delete chapter
adminChapterRoutes.openapi(DeleteChapterRoute, async (c) => {
  try {
    const { comicId, id: chapterId } = c.req.valid("param");
    const service = new ChapterService(c.env.DATABASE_URL, c.env);

    const chNum = await service.deleteChapter(comicId, chapterId);
    return successResponse(c, {
      success: true,
      message: `Chapter ${chNum} deleted successfully.`,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete chapter.", 400);
  }
});
