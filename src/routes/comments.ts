import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireSession } from "@/middleware/auth";
import { CommentService } from "@/services/comment.service";
import { RealtimeBroadcaster } from "@/services/realtime-broadcaster";
import { successResponse, errorResponse } from "@/utils/response";
import { CommonErrorResponses, UserSecurity } from "@/schemas/common";

const CommentSchema = z.unknown().openapi({ type: "object", description: "Comment data." });
const commentIdParam = z.object({ commentId: z.string().min(1) });
const GetCommentsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Comments"],
  operationId: "listComments",
  summary: "List comments",
  description: "Returns comments for a comic or chapter.",
  request: {
    query: z.object({ comicId: z.string().optional(), chapterId: z.string().optional() }),
  },
  responses: {
    200: {
      description: "The matching comments.",
      content: { "application/json": { schema: z.object({ comments: z.array(CommentSchema) }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const PostCommentRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Comments"],
  operationId: "createComment",
  summary: "Post a comment",
  description:
    "Creates a comment as an authenticated user or as a guest with guestName and guestEmail.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              comicId: z.string().optional(),
              chapterId: z.string().optional(),
              content: z.string(),
              guestName: z.string().optional(),
              guestEmail: z.string().email().optional(),
            })
            .passthrough(),
        },
      },
    },
  },
  responses: {
    201: {
      description: "The comment was created.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), comment: CommentSchema }) },
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
const LikeCommentRoute = createRoute({
  method: "post",
  path: "/{commentId}/like",
  tags: ["Comments"],
  operationId: "toggleCommentLike",
  summary: "Toggle a comment like",
  description: "Adds or removes the authenticated user's like on a comment.",
  security: UserSecurity,
  middleware: [requireSession],
  request: { params: commentIdParam },
  responses: {
    200: {
      description: "The like state was updated.",
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
const DeleteCommentRoute = createRoute({
  method: "delete",
  path: "/{commentId}",
  tags: ["Comments"],
  operationId: "deleteComment",
  summary: "Delete a comment",
  description: "Deletes a comment owned by the authenticated user or an administrator.",
  security: UserSecurity,
  middleware: [requireSession],
  request: { params: commentIdParam },
  responses: {
    200: {
      description: "The comment was deleted.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), comment: CommentSchema }) },
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
const ReportCommentRoute = createRoute({
  method: "post",
  path: "/{commentId}/report",
  tags: ["Comments"],
  operationId: "reportComment",
  summary: "Report a comment",
  description: "Submits a moderation report. Guest reporter details may be supplied.",
  request: {
    params: commentIdParam,
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              reason: z.string().min(1),
              details: z.string().optional(),
              guestName: z.string().optional(),
              guestEmail: z.string().email().optional(),
            })
            .passthrough(),
        },
      },
    },
  },
  responses: {
    201: {
      description: "The report was submitted.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), report: z.unknown() }) },
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

export const commentRoutes = new OpenAPIHono<AppEnv>();

commentRoutes.openapi(GetCommentsRoute, async (c) => {
  try {
    const { comicId, chapterId } = c.req.valid("query");

    const service = new CommentService(c.env.DATABASE_URL, c.env);
    const result = await service.getComments(comicId, chapterId);

    return successResponse(c, { comments: result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch comments", 400);
  }
});

commentRoutes.openapi(PostCommentRoute, async (c) => {
  try {
    const user = c.get("user");
    const body = c.req.valid("json");

    if (!user && (!body.guestName || !body.guestEmail)) {
      return errorResponse(c, "Unauthorized or guest details missing", 401);
    }

    const service = new CommentService(c.env.DATABASE_URL, c.env);
    const userId = user ? user.userId : null;

    const comment = await service.postComment(userId, body);

    // Broadcast to live listeners via RealtimeBroadcaster using formatted comment
    const targetId = body.chapterId || body.comicId;
    if (targetId) {
      const formattedComment = await service.getFormattedCommentById(comment.id);
      const broadcaster = new RealtimeBroadcaster(c.env);
      c.executionCtx.waitUntil(
        broadcaster.broadcastComment(`comment_stream:${targetId}`, formattedComment || comment),
      );
    }

    return successResponse(c, { success: true, comment }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to post comment", 400);
  }
});

commentRoutes.openapi(LikeCommentRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { commentId } = c.req.valid("param");
    const service = new CommentService(c.env.DATABASE_URL, c.env);

    const result = await service.toggleLike(user.userId, commentId);
    return successResponse(c, { success: true, ...result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to toggle comment like", 400);
  }
});

commentRoutes.openapi(DeleteCommentRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { commentId } = c.req.valid("param");
    const service = new CommentService(c.env.DATABASE_URL, c.env);
    const isAdmin = user.role === "admin";

    const result = await service.deleteComment(commentId, user.userId, isAdmin);
    return successResponse(c, { success: true, comment: result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete comment", 400);
  }
});

commentRoutes.openapi(ReportCommentRoute, async (c) => {
  try {
    const user = c.get("user");
    const { commentId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new CommentService(c.env.DATABASE_URL, c.env);

    const result = await service.reportComment({
      commentId,
      reporterUserId: user?.userId || null,
      reporterGuestName: body.guestName || null,
      reporterGuestEmail: body.guestEmail || null,
      reason: body.reason,
      details: body.details || null,
    });

    return successResponse(c, { success: true, report: result }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to submit report", 400);
  }
});
