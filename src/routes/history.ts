import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { requireSession, type AppEnv } from "@/middleware/auth";
import { HistoryService } from "@/services/history.service";
import { successResponse, errorResponse } from "@/utils/response";
import { toPublicUrl } from "@/lib/storage";
import { CommonErrorResponses, UserSecurity } from "@/schemas/common";

const ListHistoryRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Reading History"],
  operationId: "listReadingHistory",
  summary: "List the current user's reading history",
  description:
    "Returns the authenticated user's reading history, including resolved comic media URLs.",
  security: UserSecurity,
  middleware: [requireSession],
  responses: {
    200: {
      description: "The user's reading history.",
      content: { "application/json": { schema: z.object({ history: z.array(z.unknown()) }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const RecordHistoryRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Reading History"],
  operationId: "recordReadingProgress",
  summary: "Record reading progress",
  description: "Creates or updates reading progress for the authenticated user.",
  security: UserSecurity,
  middleware: [requireSession],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            comicId: z.string().min(1),
            chapterId: z.string().min(1),
            lastReadPage: z.number().int().min(1).optional(),
            snapshotTotalPages: z.number().int().min(1).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reading progress was recorded.",
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

export const historyRoutes = new OpenAPIHono<AppEnv>();
historyRoutes.use("*", requireSession);

historyRoutes.openapi(ListHistoryRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const service = new HistoryService(c.env.DATABASE_URL);
    const list = await service.getUserHistory(user.userId);

    // Resolve relative storage paths to full public URLs
    const resolved = list.map((h: any) => ({
      ...h,
      comic: h.comic
        ? {
            ...h.comic,
            coverUrl: toPublicUrl(h.comic.coverUrl, "media", c.env) ?? h.comic.coverUrl,
            bannerUrl: toPublicUrl(h.comic.bannerUrl, "media", c.env),
          }
        : h.comic,
    }));

    return successResponse(c, { history: resolved });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch history", 500);
  }
});

historyRoutes.openapi(RecordHistoryRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId, chapterId, lastReadPage = 1, snapshotTotalPages = 1 } = c.req.valid("json");
    const service = new HistoryService(c.env.DATABASE_URL);

    const result = await service.recordHistory(
      user.userId,
      comicId,
      chapterId,
      lastReadPage,
      snapshotTotalPages,
      c.env.KV_KOMIKHQ,
    );
    return successResponse(c, {
      success: true,
      message: `Reading history ${result.action}`,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to record reading history", 400);
  }
});
