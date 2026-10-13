import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "./auth";

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Authentication is required." }, 401);
  }

  if (user.role !== "admin") {
    return c.json({ error: "Administrator access is required." }, 403);
  }

  await next();
};
