import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../src/middleware/auth";
import { registerApiDocs } from "../../src/routes/api-docs";
import { healthRoutes } from "../../src/routes/health";

function createApp() {
  const app = new OpenAPIHono<AppEnv>();
  app.route("/", healthRoutes);
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
  assert.ok(document.components.schemas.Pagination);
  assert.ok(document.components.securitySchemes.SessionCookie);
  assert.ok(document.components.securitySchemes.BearerToken);

  const operationIds = Object.values(document.paths).flatMap((path) =>
    Object.values(path).map((operation) => operation.operationId),
  );
  assert.ok(operationIds.every((operationId) => operationId));
  assert.equal(new Set(operationIds).size, operationIds.length);
});

test("documents every route declared by the Hono route modules", async () => {
  const response = await createApp().request("/openapi.json");
  const document = (await response.json()) as {
    paths: Record<string, Record<string, unknown>>;
  };
  const routeFiles = [
    "admin-chapters.ts",
    "admin-comics.ts",
    "admin-genres.ts",
    "admin-storage.ts",
    "admin-system.ts",
    "admin.ts",
    "auth.ts",
    "bookmarks.ts",
    "comics.ts",
    "comments.ts",
    "genres.ts",
    "history.ts",
    "realtime.ts",
    "ratings.ts",
    "search.ts",
    "sitemaps.ts",
    "user.ts",
    "views.ts",
  ];
  const routerPrefixes: Record<string, string> = {
    adminChapterRoutes: "/v1/admin",
    adminComicRoutes: "/v1/admin",
    adminGenreRoutes: "/v1/admin",
    adminStorageRoutes: "/v1/admin",
    adminSystemRoutes: "/v1/admin",
    adminRoutes: "/v1/admin",
    authRoutes: "/v1/auth",
    bookmarkRoutes: "/v1/bookmarks",
    comicRoutes: "/v1/comics",
    commentRoutes: "/v1/comments",
    historyRoutes: "/v1/history",
    realtimeRoutes: "/v1/realtime",
    ratingRoutes: "/v1/ratings",
    searchRoutes: "/v1/search",
    sitemapRoutes: "/v1/sitemaps",
    sitemapXmlRoutes: "",
    userRoutes: "/v1/user",
    viewRoutes: "/v1/view",
  };

  for (const file of routeFiles) {
    const source = readFileSync(resolve(process.cwd(), "src/routes", file), "utf8");
    const routeDeclarations = source.matchAll(
      /^\s*(\w+)\.(get|post|put|delete)\s*\(\s*["']([^"']+)["']/gm,
    );

    for (const [, routerName, method, routePath] of routeDeclarations) {
      if (!routerPrefixes[routerName] && routerName !== "routes") continue;
      const mountPrefix =
        routerPrefixes[routerName] ??
        (file === "genres.ts" ? "/v1/genres" : file === "search.ts" ? "/v1/search" : undefined);
      assert.ok(mountPrefix !== undefined, `Missing mount prefix for ${routerName} in ${file}`);
      const fullPath = `${mountPrefix}${routePath === "/" ? "" : routePath}`.replace(
        /:([^/]+)/g,
        "{$1}",
      );
      assert.ok(
        document.paths[fullPath]?.[method],
        `Missing OpenAPI operation ${method.toUpperCase()} ${fullPath}`,
      );
    }
  }

  assert.ok(document.paths["/health"]?.get, "Missing OpenAPI health operation");
  assert.ok(document.paths["/v1/auth/get-session"]?.get);
  assert.ok(document.paths["/v1/auth/sign-in/email"]?.post);
});
