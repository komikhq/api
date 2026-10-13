import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { ChapterService } from "@/services/chapter.service";
import { successResponse, errorResponse } from "@/utils/response";
import { AdminSecurity, CommonErrorResponses } from "@/schemas/common";

const PurgeOrphanStorageRoute = createRoute({
  method: "post",
  path: "/storage/purge-orphans",
  tags: ["Administration"],
  operationId: "purgeOrphanedStorageFiles",
  summary: "Purge orphaned storage files",
  description:
    "Deletes storage files not associated with database records. Requires administrator access.",
  security: AdminSecurity,
  responses: {
    200: {
      description: "Orphaned files were purged.",
      content: { "application/json": { schema: z.object({ success: z.boolean() }).passthrough() } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});

export const adminStorageRoutes = new OpenAPIHono<AppEnv>();

adminStorageRoutes.use("*", requireAdmin);

// POST /v1/admin/storage/purge-orphans - Purge orphan image files in R2 not registered in DB
adminStorageRoutes.openapi(PurgeOrphanStorageRoute, async (c) => {
  try {
    const service = new ChapterService(c.env.DATABASE_URL, c.env);
    const result = await service.purgeOrphanImages();

    return successResponse(c, {
      success: true,
      message: `Cleanup successful! ${result.purgedCount} orphan files (${result.totalSizeMB} MB) deleted from R2.`,
      "purged-count": result.purgedCount,
      "total-size-mb": result.totalSizeMB,
      ...result,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to purge orphan images.", 500);
  }
});
