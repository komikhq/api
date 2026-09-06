import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { BookmarkService } from "@/services/bookmark.service";
import { successResponse, errorResponse } from "@/utils/response";

export const bookmarkRoutes = new Hono<AppEnv>();

bookmarkRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const service = new BookmarkService(c.env.DATABASE_URL);
    const list = await service.getUserBookmarks(user.userId);

    return successResponse(c, { bookmarks: list });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to get bookmarks", 500);
  }
});

bookmarkRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId, status = "reading" } = await c.req.json();
    const service = new BookmarkService(c.env.DATABASE_URL);

    const result = await service.saveBookmark(user.userId, comicId, status);
    return successResponse(c, { success: true, message: `Bookmark ${result.action}` });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to save bookmark", 400);
  }
});

bookmarkRoutes.delete("/:comicId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const comicId = c.req.param("comicId");
    const service = new BookmarkService(c.env.DATABASE_URL);

    await service.removeBookmark(user.userId, comicId);
    return successResponse(c, { success: true, message: "Bookmark removed" });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to remove bookmark", 400);
  }
});
