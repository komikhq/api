import { swaggerUI } from "@hono/swagger-ui"
import type { OpenAPIHono } from "@hono/zod-openapi"
import type { AppEnv } from "@/middleware/auth"

export function registerApiDocs(app: OpenAPIHono<AppEnv>) {
  app.get("/", swaggerUI({ url: "/openapi.json" }))
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "KomikHQ API",
      version: "1.0.0",
      description:
        "API for the KomikHQ platform. Routes are documented as they are migrated to the OpenAPI route format.",
    },
  })
}
