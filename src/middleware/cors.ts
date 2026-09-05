import { cors } from "hono/cors";

export function corsMiddleware() {
  return cors({
    origin: ["https://komikhq.com", "http://localhost:4321"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
}
