import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { requireSession, type AppEnv } from "@/middleware/auth";
import { RatingService } from "@/services/rating.service";
import { successResponse, errorResponse } from "@/utils/response";
import { CommonErrorResponses, UserSecurity } from "@/schemas/common";

const SubmitRatingRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Ratings"],
  operationId: "submitComicRating",
  summary: "Submit a comic rating",
  description: "Creates or updates the authenticated user's rating for a comic.",
  security: UserSecurity,
  middleware: [requireSession],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ comicId: z.string().min(1), score: z.number() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The rating was recorded.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), message: z.string(), score: z.number() }),
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

export const ratingRoutes = new OpenAPIHono<AppEnv>();
ratingRoutes.use("*", requireSession);

ratingRoutes.openapi(SubmitRatingRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId, score } = c.req.valid("json");
    const service = new RatingService(c.env.DATABASE_URL);

    const result = await service.submitRating(user.userId, comicId, score);
    return successResponse(c, {
      success: true,
      message: `Rating ${result.action}`,
      score,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to submit rating", 400);
  }
});
