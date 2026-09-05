import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient } from "@/db";
import { sql } from "drizzle-orm";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/", async (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");

  let dbStatus = "ok";
  let cacheStatus = "ok";
  let storageStatus = "ok";

  // 1. Probe Database Connection Live Status
  try {
    const db = createDbClient(c.env.DATABASE_URL);
    await db.execute(sql`SELECT 1`);
  } catch (err) {
    dbStatus = "error";
  }

  // 2. Probe Cache Availability Live Status
  try {
    if (!c.env.KV_KOMIKHQ) {
      cacheStatus = "error";
    }
  } catch (err) {
    cacheStatus = "error";
  }

  // 3. Probe Storage Availability Live Status
  try {
    if (!c.env.MEDIA_BUCKET) {
      storageStatus = "error";
    }
  } catch (err) {
    storageStatus = "error";
  }

  const isHealthy = dbStatus === "ok" && cacheStatus === "ok" && storageStatus === "ok";

  return c.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        cache: cacheStatus,
        storage: storageStatus,
      },
    },
    isHealthy ? 200 : 503
  );
});
