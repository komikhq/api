import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { createDbClient, users, accounts } from "@/db";
import { eq, like, or, count, desc } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export const adminRoutes = new Hono<AppEnv>();

// Apply admin guard to all /v1/admin/* routes
adminRoutes.use("*", requireAdmin());

// GET /v1/admin/users - Get paginated & searchable users list
adminRoutes.get("/users", async (c) => {
  const db = createDbClient(c.env.DATABASE_URL);
  const query = c.req.query("q") || "";
  const page = parseInt(c.req.query("page") || "1", 10);
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const offset = (page - 1) * limit;

  const searchCondition = query
    ? or(like(users.name, `%${query}%`), like(users.email, `%${query}%`))
    : undefined;

  const [totalRes] = await db
    .select({ count: count() })
    .from(users)
    .where(searchCondition);

  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(searchCondition)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    users: userList,
    pagination: {
      page,
      limit,
      total: totalRes?.count || 0,
      totalPages: Math.ceil((totalRes?.count || 0) / limit),
    },
  });
});

// POST /v1/admin/users - Create new user remotely
adminRoutes.post("/users", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, role = "user" } = body;

    if (!name || !email || !password) {
      return c.json({ error: "Name, email, and password are required." }, 400);
    }

    const auth = getAuth(c.env as any);
    const newUser = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!newUser) {
      return c.json({ error: "Failed to create user via auth engine." }, 500);
    }

    const db = createDbClient(c.env.DATABASE_URL);
    if (role && role !== "user") {
      await db.update(users).set({ role }).where(eq(users.id, newUser.user.id));
    }

    return c.json({ success: true, user: { ...newUser.user, role } });
  } catch (err: any) {
    return c.json({ error: err.message || "Error creating user" }, 500);
  }
});

// PUT /v1/admin/users/:id - Update user details (name, email, role, password)
adminRoutes.put("/users/:id", async (c) => {
  const userId = c.req.param("id");
  const body = await c.req.json();
  const { name, email, role, password } = body;

  const db = createDbClient(c.env.DATABASE_URL);
  const [existingUser] = await db.select().from(users).where(eq(users.id, userId));

  if (!existingUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const updateData: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;

  await db.update(users).set(updateData).where(eq(users.id, userId));

  if (password && password.trim().length > 0) {
    const auth = getAuth(c.env as any);
    try {
      // Direct update via drizzle accounts table if credential provider
      const [credAccount] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId));
      
      if (credAccount) {
        // Better auth reset password API
        await auth.api.setPassword({
          body: {
            newPassword: password,
          },
          headers: c.req.raw.headers,
        });
      }
    } catch (e: any) {
      console.error("[Admin API] Failed to reset password directly:", e);
    }
  }

  const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));

  return c.json({ success: true, user: updatedUser });
});

// DELETE /v1/admin/users/:id - Remove user permanently
adminRoutes.delete("/users/:id", async (c) => {
  const userId = c.req.param("id");
  const currentUser = c.get("user");

  if (userId === currentUser?.userId) {
    return c.json({ error: "Anda tidak dapat menghapus akun Anda sendiri dari admin panel." }, 400);
  }

  const db = createDbClient(c.env.DATABASE_URL);
  const [existingUser] = await db.select().from(users).where(eq(users.id, userId));

  if (!existingUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await db.delete(users).where(eq(users.id, userId));

  return c.json({ success: true, message: `User ${existingUser.name} (${existingUser.email}) deleted successfully.` });
});
