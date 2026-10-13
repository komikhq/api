import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { AdminService } from "@/services/admin.service";
import { successResponse, errorResponse } from "@/utils/response";
import { AdminSecurity, CommonErrorResponses } from "@/schemas/common";

const AdminDataSchema = z
  .unknown()
  .openapi({ type: "object", description: "Administrative response data." });
const AdminUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["Administration"],
  operationId: "adminListUsers",
  summary: "List users",
  description: "Searches and returns a paginated user list. Requires administrator access.",
  security: AdminSecurity,
  request: {
    query: z.object({
      q: z.string().optional(),
      page: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().optional(),
    }),
  },
  responses: {
    200: {
      description: "Matching users and pagination metadata.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminCreateUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Administration"],
  operationId: "adminCreateUser",
  summary: "Create a user",
  description: "Creates a user account. Requires administrator access.",
  security: AdminSecurity,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({ name: z.string(), email: z.string().email(), password: z.string() })
            .passthrough(),
        },
      },
    },
  },
  responses: {
    201: {
      description: "The user was created.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminUpdateUserRoute = createRoute({
  method: "put",
  path: "/users/{id}",
  tags: ["Administration"],
  operationId: "adminUpdateUser",
  summary: "Update a user",
  description: "Updates user details by ID. Requires administrator access.",
  security: AdminSecurity,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: z.object({}).passthrough() } } },
  },
  responses: {
    200: {
      description: "The user was updated.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminDeleteUserRoute = createRoute({
  method: "delete",
  path: "/users/{id}",
  tags: ["Administration"],
  operationId: "adminDeleteUser",
  summary: "Delete a user",
  description: "Permanently deletes a user account by ID. Requires administrator access.",
  security: AdminSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "The user was deleted.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminStatsRoute = createRoute({
  method: "get",
  path: "/stats",
  tags: ["Administration"],
  operationId: "adminGetPlatformStats",
  summary: "Get platform statistics",
  description: "Returns administrative platform statistics.",
  security: AdminSecurity,
  responses: {
    200: {
      description: "Platform statistics.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminReportsRoute = createRoute({
  method: "get",
  path: "/reports",
  tags: ["Moderation"],
  operationId: "adminListModerationReports",
  summary: "List moderation reports",
  description: "Returns paginated moderation reports, optionally filtered by status.",
  security: AdminSecurity,
  request: {
    query: z.object({
      page: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().optional(),
      status: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Matching reports and pagination metadata.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const AdminReportActionRoute = createRoute({
  method: "post",
  path: "/reports/{id}/action",
  tags: ["Moderation"],
  operationId: "adminResolveModerationReport",
  summary: "Resolve a moderation report",
  description: "Performs a moderation action on a report. Requires administrator access.",
  security: AdminSecurity,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": { schema: z.object({ action: z.enum(["delete_comment", "dismiss"]) }) },
      },
    },
  },
  responses: {
    200: {
      description: "The report action was completed.",
      content: { "application/json": { schema: AdminDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});

export const adminRoutes = new OpenAPIHono<AppEnv>();

// Apply admin guard to all /v1/admin/* routes
adminRoutes.use("*", requireAdmin);

// GET /v1/admin/users - Get paginated & searchable users list
adminRoutes.openapi(AdminUsersRoute, async (c) => {
  try {
    const params = c.req.valid("query");
    const query = params.q || "";
    const page = params.page || 1;
    const limit = params.limit || 20;

    const service = new AdminService(c.env.DATABASE_URL, c.env);
    const result = await service.listUsers({ query, page, limit });

    return successResponse(c, result);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch users.", 500);
  }
});

// POST /v1/admin/users - Create new user remotely
adminRoutes.openapi(AdminCreateUserRoute, async (c) => {
  try {
    const body = c.req.valid("json");
    const service = new AdminService(c.env.DATABASE_URL, c.env);

    const user = await service.createUser(body);
    return successResponse(c, { success: true, user }, 201);
  } catch (err: any) {
    return errorResponse(c, err.message || "Error creating user", 400);
  }
});

// PUT /v1/admin/users/:id - Update user details
adminRoutes.openapi(AdminUpdateUserRoute, async (c) => {
  try {
    const { id: userId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new AdminService(c.env.DATABASE_URL, c.env);

    const updatedUser = await service.updateUser(userId, body, c.req.raw.headers);
    return successResponse(c, { success: true, user: updatedUser });
  } catch (err: any) {
    return errorResponse(c, err.message || "User not found or update failed", 400);
  }
});

// DELETE /v1/admin/users/:id - Remove user permanently
adminRoutes.openapi(AdminDeleteUserRoute, async (c) => {
  try {
    const { id: userId } = c.req.valid("param");
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
adminRoutes.openapi(AdminStatsRoute, async (c) => {
  try {
    const service = new AdminService(c.env.DATABASE_URL, c.env);
    const stats = await service.getStats();
    return successResponse(c, stats);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch system statistics.", 500);
  }
});

// GET /v1/admin/reports - Get moderation reports
adminRoutes.openapi(AdminReportsRoute, async (c) => {
  try {
    const params = c.req.valid("query");
    const page = params.page || 1;
    const limit = params.limit || 20;
    const status = params.status || undefined;

    const service = new AdminService(c.env.DATABASE_URL, c.env);
    const result = await service.listReports(page, limit, status);

    return successResponse(c, result);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to fetch reports.", 500);
  }
});

// POST /v1/admin/reports/:id/action - Take action on moderation report
adminRoutes.openapi(AdminReportActionRoute, async (c) => {
  try {
    const { id: reportId } = c.req.valid("param");
    const body = c.req.valid("json");
    const service = new AdminService(c.env.DATABASE_URL, c.env);

    const result = await service.resolveReport(reportId, body.action);
    return successResponse(c, { success: true, report: result });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to process report.", 400);
  }
});
