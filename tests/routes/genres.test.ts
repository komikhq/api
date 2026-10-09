import assert from "node:assert/strict"
import test from "node:test"
import { Hono } from "hono"
import { authMiddleware, type AppEnv } from "../../src/middleware/auth"
import { createGenreRoutes } from "../../src/routes/genres"

const genreList = [
  {
    id: "genre-1",
    name: "Fantasy",
    slug: "fantasy",
    description: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
]

const genreResponse = {
  genres: genreList.map((genre) => ({
    ...genre,
    createdAt: genre.createdAt.toISOString(),
    updatedAt: genre.updatedAt.toISOString(),
  })),
}

function createTestApp() {
  const app = new Hono<AppEnv>()
  app.use("*", authMiddleware())
  app.route(
    "/v1/genres",
    createGenreRoutes(async () => genreList)
  )
  app.get("/v1/private", (c) => c.json({ ok: true }))
  return app
}

function createBindings(cachedSession: unknown = null) {
  return {
    DATABASE_URL: "postgres://test",
    KV_KOMIKHQ: {
      get: async <T>() => cachedSession as T | null,
    },
  } as unknown as AppEnv["Bindings"]
}

test("allows anonymous genre requests and preserves the response shape", async () => {
  const response = await createTestApp().request(
    "/v1/genres",
    {},
    createBindings()
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), genreResponse)
})

test("allows authenticated genre requests", async () => {
  const session = {
    id: "user-1",
    userId: "user-1",
    email: "reader@example.com",
    name: "Reader",
  }
  const response = await createTestApp().request(
    "/v1/genres",
    { headers: { Authorization: "Bearer valid-token" } },
    createBindings(session)
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), genreResponse)
})

test("keeps unrelated private routes protected", async () => {
  const response = await createTestApp().request(
    "/v1/private",
    {},
    createBindings()
  )

  assert.equal(response.status, 401)
})
