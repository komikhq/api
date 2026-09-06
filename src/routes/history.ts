import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { HistoryService } from "@/services/history.service";
import { successResponse, errorResponse } from "@/utils/response";

export const historyRoutes = new Hono<AppEnv>();

historyRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const service = new HistoryService(c.env.DATABASE_URL);
    const list = await service.getUserHistory(user.userId);

    return successResponse(c, { history: list });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch history", 500);
  }
});

historyRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId, chapterId, lastReadPage = 1, snapshotTotalPages = 1 } = await c.req.json();
    const service = new HistoryService(c.env.DATABASE_URL);

    const result = await service.recordHistory(user.userId, comicId, chapterId, lastReadPage, snapshotTotalPages);
    return successResponse(c, { success: true, message: `Reading history ${result.action}` });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to record reading history", 400);
  }
});
