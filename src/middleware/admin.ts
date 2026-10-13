import { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "./auth";

export function requireAdmin(): MiddlewareHandler<AppEnv> {
  return async (c: Context<AppEnv>, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized. Silakan masuk terlebih dahulu." }, 401);
    }

    if (user.role !== "admin") {
      return c.json({ error: "Forbidden. Fitur ini hanya untuk Administrator." }, 403);
    }

    await next();
  };
}
