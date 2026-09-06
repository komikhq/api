import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { CommentService } from "@/services/comment.service";
import { successResponse, errorResponse } from "@/utils/response";

export const commentRoutes = new Hono<AppEnv>();

commentRoutes.get("/", async (c) => {
  try {
    const comicId = c.req.query("comicId");
    const chapterId = c.req.query("chapterId");

    const service = new CommentService(c.env.DATABASE_URL);
    const result = await service.getComments(comicId, chapterId);

    return successResponse(c, { comments: result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch comments", 400);
  }
});

commentRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const body = await c.req.json();
    const service = new CommentService(c.env.DATABASE_URL);

    const comment = await service.postComment(user.userId, body);
    return successResponse(c, { success: true, comment }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to post comment", 400);
  }
});

commentRoutes.post("/:commentId/like", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const commentId = c.req.param("commentId");
    const service = new CommentService(c.env.DATABASE_URL);

    const result = await service.toggleLike(user.userId, commentId);
    return successResponse(c, { success: true, ...result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to toggle comment like", 400);
  }
});
