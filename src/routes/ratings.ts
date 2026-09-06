import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { RatingService } from "@/services/rating.service";
import { successResponse, errorResponse } from "@/utils/response";

export const ratingRoutes = new Hono<AppEnv>();

ratingRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId, score } = await c.req.json();
    const service = new RatingService(c.env.DATABASE_URL);

    const result = await service.submitRating(user.userId, comicId, score);
    return successResponse(c, { success: true, message: `Rating ${result.action}`, score });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to submit rating", 400);
  }
});
