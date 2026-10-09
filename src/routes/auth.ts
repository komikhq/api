import { Hono } from "hono";
import { getAuth } from "@/lib/auth";
import type { AppEnv } from "@/middleware/auth";
import { getCookie } from "hono/cookie";
import { toPublicUrl } from "@/lib/storage";

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

  const response = await auth.handler(c.req.raw);

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      const data: any = await response.json();
      if (data && typeof data === "object") {
        if (data.user && typeof data.user === "object" && data.user.image) {
          data.user.image = toPublicUrl(data.user.image, "users", c.env) ?? data.user.image;
        } else if (data.image && typeof data.image === "string") {
          data.image = toPublicUrl(data.image, "users", c.env) ?? data.image;
        }

        const newHeaders = new Headers(response.headers);
        newHeaders.delete("content-length");

        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    } catch {
      // Fallback to original response on parsing errors
    }
  }

  return response;
});

