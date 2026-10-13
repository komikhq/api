import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import type { AppEnv } from "@/middleware/auth"
import { createDbClient } from "@/db"
import { sql } from "drizzle-orm"

const serviceStatusSchema = z.enum(["ok", "error"])

const healthResponseSchema = z.object({
  status: z.enum(["healthy", "degraded"]),
  timestamp: z.iso.datetime(),
  services: z.object({
    database: serviceStatusSchema,
    cache: serviceStatusSchema,
    storage: serviceStatusSchema,
  }),
})

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Check API health",
  description: "Checks the database, cache binding, and media storage binding.",
  responses: {
    200: {
      description: "All checked services are available.",
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
    },
    503: {
      description: "One or more checked services are unavailable.",
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
    },
  },
})

export const healthRoutes = new OpenAPIHono<AppEnv>()

healthRoutes.openapi(healthRoute, async (c) => {
  c.header("Access-Control-Allow-Origin", "*")
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS")

  let dbStatus: "ok" | "error" = "ok"
  let cacheStatus: "ok" | "error" = "ok"
  let storageStatus: "ok" | "error" = "ok"

  try {
    const db = createDbClient(c.env.DATABASE_URL)
    await db.execute(sql`SELECT 1`)
  } catch (err) {
    console.error("[Health API] Database check failed:", err)
    dbStatus = "error"
  }

  if (!c.env.KV_KOMIKHQ) cacheStatus = "error"

  if (!c.env.MEDIA_BUCKET && !c.env.BUCKET_MEDIA) storageStatus = "error"

  const isHealthy =
    dbStatus === "ok" && cacheStatus === "ok" && storageStatus === "ok"

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
  )
})
