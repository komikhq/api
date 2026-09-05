import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

export interface UserSessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface AppEnv {
  Bindings: {
    KV_KOMIKHQ: KVNamespace;
    DATABASE_URL: string;
    PUSHER_APP_ID: string;
    PUSHER_KEY: string;
    PUSHER_SECRET: string;
    PUSHER_CLUSTER: string;
  };
  Variables: {
    user?: UserSessionPayload;
  };
}

export function authMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const publicPaths = [
      "/v1/auth/login",
      "/v1/auth/register",
      "/v1/view",
      "/v1/comics/trending",
      "/v1/comics/browse",
    ];

    if (publicPaths.some((path) => c.req.path.startsWith(path))) {
      return next();
    }

    const sessionId = getCookie(c, "session_id") || c.req.header("Authorization")?.replace("Bearer ", "");
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await c.env.KV_KOMIKHQ.get<UserSessionPayload>(`session:${sessionId}`, "json");
    if (!session) {
      return c.json({ error: "Session expired or revoked" }, 401);
    }

    c.set("user", session);
    await next();
  };
}
