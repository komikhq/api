import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { requireSession, type AppEnv } from "@/middleware/auth";
import { BookmarkService } from "@/services/bookmark.service";
import { successResponse, errorResponse } from "@/utils/response";
import { toPublicUrl } from "@/lib/storage";
import { CommonErrorResponses, UserSecurity } from "@/schemas/common";

const ListBookmarksRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Bookmarks"],
  operationId: "listBookmarks",
  summary: "List the current user's bookmarks",
  description: "Returns bookmarked comics for the authenticated user.",
  security: UserSecurity,
  middleware: [requireSession],
  responses: {
    200: {
      description: "The user's bookmarks.",
      content: { "application/json": { schema: z.object({ bookmarks: z.array(z.unknown()) }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const SaveBookmarkRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Bookmarks"],
  operationId: "saveBookmark",
  summary: "Create or update a bookmark",
  description: "Creates or updates a comic bookmark for the authenticated user.",
  security: UserSecurity,
  middleware: [requireSession],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ comicId: z.string().min(1), status: z.string().optional() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The bookmark was saved.",
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
const RemoveBookmarkRoute = createRoute({
  method: "delete",
  path: "/{comicId}",
  tags: ["Bookmarks"],
  operationId: "removeBookmark",
  summary: "Remove a bookmark",
  description: "Removes a comic from the authenticated user's bookmarks.",
  security: UserSecurity,
  middleware: [requireSession],
  request: { params: z.object({ comicId: z.string().min(1) }) },
  responses: {
    200: {
      description: "The bookmark was removed.",
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

export const bookmarkRoutes = new OpenAPIHono<AppEnv>();
bookmarkRoutes.use("*", requireSession);

bookmarkRoutes.openapi(ListBookmarksRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const service = new BookmarkService(c.env.DATABASE_URL);
    const list = await service.getUserBookmarks(user.userId);

    // Resolve relative storage paths to full public URLs
    const resolved = list.map((b: any) => ({
      ...b,
      comic: b.comic
        ? {
            ...b.comic,
            coverUrl: toPublicUrl(b.comic.coverUrl, "media", c.env) ?? b.comic.coverUrl,
            bannerUrl: toPublicUrl(b.comic.bannerUrl, "media", c.env),
          }
        : b.comic,
    }));

    return successResponse(c, { bookmarks: resolved });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to get bookmarks", 500);
  }
});

bookmarkRoutes.openapi(SaveBookmarkRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId, status = "reading" } = c.req.valid("json");
    const service = new BookmarkService(c.env.DATABASE_URL);

    const result = await service.saveBookmark(user.userId, comicId, status);
    return successResponse(c, {
      success: true,
      message: `Bookmark ${result.action}`,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to save bookmark", 400);
  }
});

bookmarkRoutes.openapi(RemoveBookmarkRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const { comicId } = c.req.valid("param");
    const service = new BookmarkService(c.env.DATABASE_URL);

    await service.removeBookmark(user.userId, comicId);
    return successResponse(c, { success: true, message: "Bookmark removed" });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to remove bookmark", 400);
  }
});
