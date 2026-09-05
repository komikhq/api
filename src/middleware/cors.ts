import { cors } from "hono/cors";

export function corsMiddleware() {
  return cors({
    origin: ["https://komikhq.com", "https://www.komikhq.com", "http://localhost:4321", "http://localhost:8787"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
}
