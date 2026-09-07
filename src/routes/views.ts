import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { ViewService } from "@/services/view.service";
import { successResponse, errorResponse } from "@/utils/response";

export const viewRoutes = new Hono<AppEnv>();

viewRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { comicId, chapterId } = body;
    const user = c.get("user");

    const service = new ViewService(c.env);
    const result = await service.recordView(comicId, chapterId, user?.userId || null);

    return successResponse(c, { success: true, ...result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to record view", 400);
  }
});
