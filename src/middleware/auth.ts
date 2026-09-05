import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { getAuth } from "@/lib/auth";

export interface UserSessionPayload {
  id: string;
  userId: string;
  email: string;
  name: string;
  role?: string;
  image?: string | null;
}

export interface AppEnv {
  Bindings: {
    KV_KOMIKHQ: KVNamespace;
    USERS_BUCKET: R2Bucket;
    MEDIA_BUCKET: R2Bucket;
    USERS_BUCKET_URL?: string;
    MEDIA_BUCKET_URL?: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    RESEND_API_KEY?: string;
    BREVO_API_KEY?: string;
    EMAIL_PROVIDER?: string;
    EMAIL_FROM?: string;
    PUSHER_APP_ID: string;
    PUSHER_KEY: string;
    PUSHER_SECRET: string;
    PUSHER_CLUSTER: string;
  };
  Variables: {
    user?: UserSessionPayload;
    session?: any;
  };
}

export function authMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const publicPaths = [
      "/v1/auth",
      "/v1/view",
      "/v1/comics/trending",
      "/v1/comics/browse",
    ];

    if (publicPaths.some((path) => c.req.path.startsWith(path))) {
      return next();
    }

    const token =
      getCookie(c, "komikhq.session_token") ||
      getCookie(c, "better-auth.session_token") ||
      c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // 1. Edge KV Lookup (< 1ms CPU)
    const cachedSession = await c.env.KV_KOMIKHQ.get<UserSessionPayload>(
      `session:${token}`,
      "json"
    );

    if (cachedSession) {
      c.set("user", cachedSession);
      return next();
    }

    // 2. Cache Miss: Better Auth Validation against Neon DB
    try {
      const auth = getAuth(c.env);
      const sessionData = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!sessionData || !sessionData.user) {
        return c.json({ error: "Session expired or invalid" }, 401);
      }

      const userPayload: UserSessionPayload = {
        id: sessionData.user.id,
        userId: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: (sessionData.user as any).role || "user",
        image: sessionData.user.image,
      };

      // Store in KV cache for 15 minutes (900 seconds)
      await c.env.KV_KOMIKHQ.put(
        `session:${token}`,
        JSON.stringify(userPayload),
        { expirationTtl: 900 }
      );

      c.set("user", userPayload);
      c.set("session", sessionData.session);
      return next();
    } catch (err) {
      return c.json({ error: "Authentication failed" }, 401);
    }
  };
}
