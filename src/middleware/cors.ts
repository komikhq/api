import { cors } from "hono/cors";

export function corsMiddleware() {
  return cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (
        origin.includes("komikhq.com") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)
      ) {
        return origin;
      }
      return origin;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
}

