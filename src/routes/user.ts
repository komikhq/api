import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { requireSession, type AppEnv } from "@/middleware/auth";
import { UserService } from "@/services/user.service";
import { successResponse, errorResponse } from "@/utils/response";
import { CommonErrorResponses, UserSecurity } from "@/schemas/common";

const UploadedFileSchema = z.file().openapi({ type: "string", format: "binary" });
const ProfileRoute = createRoute({
  method: "get",
  path: "/profile",
  tags: ["Users"],
  operationId: "getUserProfile",
  summary: "Get the current user's profile",
  description: "Returns profile details for the authenticated user.",
  security: UserSecurity,
  request: {},
  responses: {
    200: {
      description: "The user profile.",
      content: { "application/json": { schema: z.unknown().openapi({ type: "object" }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const UploadAvatarRoute = createRoute({
  method: "post",
  path: "/avatar",
  tags: ["Users"],
  operationId: "uploadUserAvatar",
  summary: "Upload a profile avatar",
  description: "Uploads a new avatar image for the authenticated user.",
  security: UserSecurity,
  request: {
    body: {
      content: { "multipart/form-data": { schema: z.object({ file: UploadedFileSchema }) } },
    },
  },
  responses: {
    200: {
      description: "The avatar was updated.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean(), avatarUrl: z.string() }) },
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
const DeleteProfileRoute = createRoute({
  method: "delete",
  path: "/profile",
  tags: ["Users"],
  operationId: "deleteUserAccount",
  summary: "Delete the current user's account",
  description:
    "Permanently deletes the authenticated user's account. Password or email confirmation may be supplied.",
  security: UserSecurity,
  request: {
    body: {
      required: false,
      content: {
        "application/json": {
          schema: z.object({ password: z.string().optional(), email: z.string().optional() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The account was deleted.",
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

export const userRoutes = new OpenAPIHono<AppEnv>();
userRoutes.use("*", requireSession);

userRoutes.openapi(ProfileRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const service = new UserService(c.env.DATABASE_URL, c.env);
    const profileData = await service.getProfile(user.userId);

    return successResponse(c, profileData);
  } catch (err: any) {
    return errorResponse(c, err.message || "User not found", 404);
  }
});

userRoutes.openapi(UploadAvatarRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    const body = await c.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      return errorResponse(c, "No image file provided", 400);
    }

    const service = new UserService(c.env.DATABASE_URL, c.env);
    const publicUrl = await service.updateAvatar(user.userId, file);

    return successResponse(c, { success: true, avatarUrl: publicUrl });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to upload avatar", 400);
  }
});

userRoutes.openapi(DeleteProfileRoute, async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    let body: { password?: string; email?: string } = {};
    try {
      body = await c.req.json();
    } catch (e) {}

    const service = new UserService(c.env.DATABASE_URL, c.env);
    await service.deleteOwnAccount(user.userId, user.email, body, c.req.raw.headers);

    return successResponse(c, {
      success: true,
      message: "Account deleted permanently.",
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete account.", 400);
  }
});
