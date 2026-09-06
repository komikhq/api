import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { UserService } from "@/services/user.service";
import { successResponse, errorResponse } from "@/utils/response";

export const userRoutes = new Hono<AppEnv>();

userRoutes.get("/profile", async (c) => {
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

userRoutes.post("/avatar", async (c) => {
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

userRoutes.delete("/profile", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return errorResponse(c, "Unauthorized", 401);

    let body: { password?: string; email?: string } = {};
    try {
      body = await c.req.json();
    } catch (e) {}

    const service = new UserService(c.env.DATABASE_URL, c.env);
    await service.deleteOwnAccount(user.userId, user.email, body, c.req.raw.headers);

    return successResponse(c, { success: true, message: "Akun berhasil dihapus permanen." });
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal menghapus akun.", 400);
  }
});
