import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { CommentService } from "@/services/comment.service";
import { RealtimeBroadcaster } from "@/services/realtime-broadcaster";
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
    const body = await c.req.json();

    if (!user && (!body.guestName || !body.guestEmail)) {
      return errorResponse(c, "Unauthorized or guest details missing", 401);
    }

    const service = new CommentService(c.env.DATABASE_URL);
    const userId = user ? user.userId : null;

    const comment = await service.postComment(userId, body);

    // Broadcast to live listeners via RealtimeBroadcaster
    const targetId = body.chapterId || body.comicId;
    if (targetId) {
      const broadcaster = new RealtimeBroadcaster(c.env);
      c.executionCtx.waitUntil(
        broadcaster.broadcastComment(`comment_stream:${targetId}`, comment)
      );
    }

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
