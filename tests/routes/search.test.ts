import assert from "node:assert/strict";
import test from "node:test";
import { Hono } from "hono";
import { authMiddleware, type AppEnv } from "../../src/middleware/auth";
import { createSearchRoutes } from "../../src/routes/search";
import type { ComicSuggestion } from "../../src/services/comic-search.service";

const suggestion: ComicSuggestion = {
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  slug: "solo-leveling",
  title: "Solo Leveling",
  matchedTitle: "Only I Level Up",
  coverUrl: "https://example.com/cover.jpg",
  type: "Manhwa",
  status: "Completed",
};

function createTestApp(loadSuggestions: (query: string, limit: number) => Promise<ComicSuggestion[]>) {
  const app = new Hono<AppEnv>();
  app.use("*", authMiddleware());
  app.route("/v1/search", createSearchRoutes(async (_databaseUrl, query, limit) => loadSuggestions(query, limit)));
  app.get("/v1/sitemaps/comics", (c) => c.json({ ok: true }));
  app.get("/v1/private", (c) => c.json({ ok: true }));
  return app;
}

function createBindings(cache = new Map<string, unknown>()) {
  const writes: { key: string; value: string; expirationTtl: number }[] = [];
  const bindings = {
    DATABASE_URL: "postgres://test",
    KV_KOMIKHQ: {
      get: async <T>(key: string) => (cache.get(key) as T | undefined) ?? null,
      put: async (key: string, value: string, options: { expirationTtl: number }) => {
        writes.push({ key, value, expirationTtl: options.expirationTtl });
        cache.set(key, JSON.parse(value));
      },
    },
  } as unknown as AppEnv["Bindings"];
  return { bindings, writes, cache };
}

test("anonymous requests return the contract and cache results for five minutes", async () => {
  let loaded: { query: string; limit: number } | null = null;
  const app = createTestApp(async (query, limit) => {
    loaded = { query, limit };
    return [suggestion];
  });
  const { bindings, writes } = createBindings();

  const response = await app.request(
    "/v1/search/suggestions?q=Solo%20Leveling&limit=20",
    {},
    bindings,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { query: "solo leveling", suggestions: [suggestion] });
  assert.deepEqual(loaded, { query: "solo leveling", limit: 6 });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].expirationTtl, 300);
});

test("uses a cached suggestion list without querying the database again", async () => {
  const cache = new Map([["comic-search:suggestions:v1:6:solo leveling", [suggestion]]]);
  const app = createTestApp(async () => {
    throw new Error("cache hit should skip database");
  });
  const { bindings, writes } = createBindings(cache);

  const response = await app.request("/v1/search/suggestions?q=solo%20leveling", {}, bindings);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { query: "solo leveling", suggestions: [suggestion] });
  assert.equal(writes.length, 0);
});

test("returns empty suggestions for short queries and no matches", async () => {
  let calls = 0;
  const app = createTestApp(async () => {
    calls += 1;
    return [];
  });
  const { bindings } = createBindings();

  const shortResponse = await app.request("/v1/search/suggestions?q=a", {}, bindings);
  assert.equal(shortResponse.status, 200);
  assert.deepEqual(await shortResponse.json(), { query: "a", suggestions: [] });
  assert.equal(calls, 0);

  const noMatchResponse = await app.request("/v1/search/suggestions?q=unknown%20comic", {}, bindings);
  assert.equal(noMatchResponse.status, 200);
  assert.deepEqual(await noMatchResponse.json(), { query: "unknown comic", suggestions: [] });
  assert.equal(calls, 1);
});

test("rejects oversized queries and keeps unrelated routes protected", async () => {
  const app = createTestApp(async () => []);
  const { bindings } = createBindings();

  const oversized = await app.request(
    `/v1/search/suggestions?q=${"a".repeat(81)}`,
    {},
    bindings,
  );
  assert.equal(oversized.status, 400);

  const privateResponse = await app.request("/v1/private", {}, bindings);
  assert.equal(privateResponse.status, 401);

  const sitemapResponse = await app.request("/v1/sitemaps/comics", {}, bindings);
  assert.equal(sitemapResponse.status, 200);
});