import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { ViewService } from "@/services/view.service";
import { successResponse, errorResponse } from "@/utils/response";
import { CommonErrorResponses } from "@/schemas/common";

const RecordViewRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Views"],
  operationId: "recordComicView",
  summary: "Record a comic or chapter view",
  description: "Records a view. Requests identified as bots are accepted but not counted.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ comicId: z.string().min(1), chapterId: z.string().min(1) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The view was recorded or ignored.",
      content: {
        "application/json": { schema: z.object({ success: z.literal(true) }).passthrough() },
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

export const viewRoutes = new OpenAPIHono<AppEnv>();

viewRoutes.openapi(RecordViewRoute, async (c) => {
  try {
    const body = c.req.valid("json");
    const { comicId, chapterId } = body;
    const user = c.get("user");

    const userAgent = c.req.header("user-agent") || "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bytespider/i.test(userAgent);
    if (isBot) {
      return successResponse(c, {
        success: true,
        ignored: true,
        timestamp: new Date().toISOString(),
      });
    }

    const service = new ViewService(c.env);
    const result = await service.recordView(comicId, chapterId, user?.userId || null);

    return successResponse(c, { success: true, ...result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to record view", 400);
  }
});
