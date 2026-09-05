import { Hono } from "hono";
import { getAuth } from "@/lib/auth";
import type { AppEnv } from "@/middleware/auth";
import { getCookie } from "hono/cookie";

export const authRoutes = new Hono<AppEnv>();

// Mount Better Auth handler for all /v1/auth/* endpoints (sign-in, sign-up, google oauth, callback, session, logout)
authRoutes.on(["POST", "GET"], "/*", async (c) => {
  const auth = getAuth(c.env);

  // If user calls logout, purge KV session cache
  if (c.req.path.endsWith("/sign-out") || c.req.path.endsWith("/logout")) {
    const token =
      getCookie(c, "komikhq.session_token") ||
      getCookie(c, "better-auth.session_token") ||
      c.req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await c.env.KV_KOMIKHQ.delete(`session:${token}`);
    }
  }

  return auth.handler(c.req.raw);
});
