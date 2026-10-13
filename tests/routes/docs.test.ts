import assert from "node:assert/strict"
import test from "node:test"
import { OpenAPIHono } from "@hono/zod-openapi"
import type { AppEnv } from "../../src/middleware/auth"
import { registerApiDocs } from "../../src/routes/api-docs"
import { healthRoutes } from "../../src/routes/health"

function createApp() {
  const app = new OpenAPIHono<AppEnv>()
  app.route("/", healthRoutes)
  registerApiDocs(app)
  return app
}

test("serves Swagger UI at the API root", async () => {
  const response = await createApp().request("/")

  assert.equal(response.status, 200)
  assert.match(response.headers.get("content-type") ?? "", /text\/html/)
  assert.match(await response.text(), /\/openapi\.json/)
})

test("serves an OpenAPI document with the health endpoint", async () => {
  const response = await createApp().request("/openapi.json")
  const document = (await response.json()) as {
    info: { title: string }
    paths: Record<string, unknown>
  }

  assert.equal(response.status, 200)
  assert.equal(document.info.title, "KomikHQ API")
  assert.ok(document.paths["/health"])
})
