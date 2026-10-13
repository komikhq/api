import assert from "node:assert/strict";
import test from "node:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../src/middleware/auth";
import { adminChapterRoutes } from "../../src/routes/admin-chapters";
import { adminComicRoutes } from "../../src/routes/admin-comics";
import { adminGenreRoutes } from "../../src/routes/admin-genres";
import { adminStorageRoutes } from "../../src/routes/admin-storage";
import { adminSystemRoutes } from "../../src/routes/admin-system";
import { adminRoutes } from "../../src/routes/admin";
import { registerApiDocs } from "../../src/routes/api-docs";
import { authRoutes } from "../../src/routes/auth";
import { bookmarkRoutes } from "../../src/routes/bookmarks";
import { commentRoutes } from "../../src/routes/comments";
import { comicRoutes } from "../../src/routes/comics";
import { genreRoutes } from "../../src/routes/genres";
import { healthRoutes } from "../../src/routes/health";
import { historyRoutes } from "../../src/routes/history";
import { ratingRoutes } from "../../src/routes/ratings";
import { realtimeRoutes } from "../../src/routes/realtime";
import { searchRoutes } from "../../src/routes/search";
import { sitemapRoutes, sitemapXmlRoutes } from "../../src/routes/sitemaps";
import { userRoutes } from "../../src/routes/user";
import { viewRoutes } from "../../src/routes/views";

function createApp() {
  const app = new OpenAPIHono<AppEnv>();
  app.route("/", healthRoutes);
  app.route("/", sitemapXmlRoutes);
  app.route("/v1/auth", authRoutes);
  app.route("/v1/user", userRoutes);
  app.route("/v1/admin", adminRoutes);
  app.route("/v1/admin", adminGenreRoutes);
  app.route("/v1/admin", adminComicRoutes);
  app.route("/v1/admin", adminChapterRoutes);
  app.route("/v1/admin", adminStorageRoutes);
  app.route("/v1/admin", adminSystemRoutes);
  app.route("/v1/genres", genreRoutes);
  app.route("/v1/search", searchRoutes);
  app.route("/v1/bookmarks", bookmarkRoutes);
  app.route("/v1/history", historyRoutes);
  app.route("/v1/comments", commentRoutes);
  app.route("/v1/ratings", ratingRoutes);
  app.route("/v1/view", viewRoutes);
  app.route("/v1/comics", comicRoutes);
  app.route("/v1/sitemaps", sitemapRoutes);
  app.route("/v1/realtime", realtimeRoutes);
  registerApiDocs(app);
  return app;
}

test("serves Swagger UI at the API root", async () => {
  const response = await createApp().request("/");

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  assert.match(await response.text(), /\/openapi\.json/);
});

test("serves an OpenAPI document with the health endpoint", async () => {
  const response = await createApp().request("/openapi.json");
  const document = (await response.json()) as {
    info: { title: string };
    paths: Record<string, Record<string, { operationId?: string }>>;
    components: {
      schemas: Record<string, unknown>;
      securitySchemes: Record<string, unknown>;
    };
  };

  assert.equal(response.status, 200);
  assert.equal(document.info.title, "KomikHQ API");
  assert.ok(document.paths["/health"]);
  assert.ok(document.paths["/v1/admin/comics/{comicId}/chapters/{id}/pages/upload"]);
  assert.ok(document.paths["/v1/auth/sign-in/email"]);
  assert.ok(document.components.schemas.ErrorResponse);
  assert.ok(document.components.securitySchemes.SessionCookie);
  assert.ok(document.components.securitySchemes.BearerToken);

  const operationIds = Object.values(document.paths).flatMap((path) =>
    Object.values(path).map((operation) => operation.operationId),
  );
  assert.ok(operationIds.every((operationId) => operationId));
  assert.equal(new Set(operationIds).size, operationIds.length);
});

test("includes route-local operations from every mounted feature module", async () => {
  const response = await createApp().request("/openapi.json");
  const document = (await response.json()) as {
    paths: Record<string, Record<string, { operationId?: string }>>;
  };
  const paths = document.paths;
  assert.ok(Object.keys(paths).length >= 45, "Expected all feature operations in the document");
  assert.ok(paths["/health"]?.get);
  assert.ok(paths["/v1/admin/comics/{comicId}/chapters/{id}/pages/upload"]?.post);
  assert.ok(paths["/v1/admin/users"]?.get);
  assert.ok(paths["/v1/auth/get-session"]?.get);
  assert.ok(paths["/v1/auth/sign-in/email"]?.post);
  assert.ok(paths["/v1/bookmarks"]?.get);
  assert.ok(paths["/v1/comics"]?.get);
  assert.ok(paths["/v1/comics/{slug}"]?.get);
  assert.ok(paths["/v1/realtime/auth"]?.post);
  assert.ok(paths["/v1/search/suggestions"]?.get);
  assert.ok(paths["/v1/user/profile"]?.get);

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      assert.ok(operation.operationId, `Missing operationId for ${method.toUpperCase()} ${path}`);
    }
  }
});
