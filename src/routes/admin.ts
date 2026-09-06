import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { AdminService } from "@/services/admin.service";
import { successResponse, errorResponse } from "@/utils/response";

export const adminRoutes = new Hono<AppEnv>();

// Apply admin guard to all /v1/admin/* routes
adminRoutes.use("*", requireAdmin());

// GET /v1/admin/users - Get paginated & searchable users list
adminRoutes.get("/users", async (c) => {
  try {
    const query = c.req.query("q") || "";
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "20", 10);

    const service = new AdminService(c.env.DATABASE_URL, c.env);
    const result = await service.listUsers({ query, page, limit });

    return successResponse(c, result);
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal mengambil daftar pengguna.", 500);
  }
});

// POST /v1/admin/users - Create new user remotely
adminRoutes.post("/users", async (c) => {
  try {
    const body = await c.req.json();
    const service = new AdminService(c.env.DATABASE_URL, c.env);

    const user = await service.createUser(body);
    return successResponse(c, { success: true, user }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Error creating user", 400);
  }
});

// PUT /v1/admin/users/:id - Update user details
adminRoutes.put("/users/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const service = new AdminService(c.env.DATABASE_URL, c.env);

    const updatedUser = await service.updateUser(userId, body, c.req.raw.headers);
    return successResponse(c, { success: true, user: updatedUser });
  } catch (err: any) {
    return errorResponse(c, err.message || "User not found or update failed", 400);
  }
});

// DELETE /v1/admin/users/:id - Remove user permanently
adminRoutes.delete("/users/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const currentUser = c.get("user");
    const service = new AdminService(c.env.DATABASE_URL, c.env);

    const deletedUser = await service.deleteUser(userId, currentUser?.userId);
    return successResponse(c, {
      success: true,
      message: `User ${deletedUser.name} (${deletedUser.email}) deleted successfully.`,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to delete user", 400);
  }
});

// GET /v1/admin/stats - System stats overview
adminRoutes.get("/stats", async (c) => {
  try {
    const service = new AdminService(c.env.DATABASE_URL, c.env);
    const stats = await service.getStats();
    return successResponse(c, stats);
  } catch (err: any) {
    return errorResponse(c, err.message || "Gagal mengambil statistik sistem.", 500);
  }
});
