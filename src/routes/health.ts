import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  return c.json({
    status: "healthy",
    service: "KomikHQ API Worker",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    stack: {
      framework: "Hono.js",
      runtime: "Cloudflare Workers",
      auth: "Better Auth",
      database: "Neon PostgreSQL + Drizzle ORM",
      cache: "Cloudflare KV",
      storage: "Cloudflare R2",
    },
  });
});
