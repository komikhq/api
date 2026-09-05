import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import type { AppEnv } from "../middleware/auth";

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  // Placeholder authentication payload ready for Neon DB lookup
  const sessionId = crypto.randomUUID();
  const userPayload = {
    userId: "usr_demo123",
    email,
    name: email.split("@")[0],
    role: "user",
  };

  // Store session in Cloudflare KV (7 days TTL)
  await c.env.KV_KOMIKHQ.put(
    `session:${sessionId}`,
    JSON.stringify(userPayload),
    { expirationTtl: 604800 }
  );

  // Set HttpOnly Cookie scoped to .komikhq.com
  setCookie(c, "session_id", sessionId, {
    domain: ".komikhq.com",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 604800,
  });

  return c.json({ success: true, user: userPayload });
});

authRoutes.post("/logout", async (c) => {
  const sessionId = c.req.header("Authorization")?.replace("Bearer ", "");
  if (sessionId) {
    await c.env.KV_KOMIKHQ.delete(`session:${sessionId}`);
  }

  deleteCookie(c, "session_id", { domain: ".komikhq.com", path: "/" });
  return c.json({ success: true });
});

authRoutes.get("/me", (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Not logged in" }, 401);
  return c.json({ user });
});
