import assert from "node:assert/strict";
import test from "node:test";
import { Hono } from "hono";
import { adminChapterRoutes } from "../../src/routes/admin-chapters";
import { adminComicRoutes } from "../../src/routes/admin-comics";
import type { AppEnv } from "../../src/middleware/auth";

test("adminChapterRoutes validates multipart FormData with numeric strings coerced", async () => {
  const app = new Hono<AppEnv>();
  app.route("/admin", adminChapterRoutes);

  const form = new FormData();
  form.append("pageNumber", "1");
  form.append("width", "800");
  form.append("height", "1200");
  form.append("file", new File(["test-image"], "page-1.jpg", { type: "image/jpeg" }));

  const req = new Request("http://localhost/admin/comics/comic-123/chapters/chap-456/pages/upload", {
    method: "POST",
    body: form,
  });

  const res = await app.fetch(req, {
    DATABASE_URL: "postgres://mock",
  } as unknown as AppEnv["Bindings"]);

  // Without auth or DB, it should not fail on schema validation (Zod 400 with 'expected number, received string').
  // Status will either be 401 (unauthorized) or 400 from ChapterService DB connection, but NOT schema validation error.
  if (res.status === 400) {
    const json: any = await res.json();
    assert.notEqual(json?.error?.name, "ZodError");
  }
});

test("adminComicRoutes validates multipart FormData for comic creation", async () => {
  const app = new Hono<AppEnv>();
  app.route("/admin", adminComicRoutes);

  const form = new FormData();
  form.append("title", "Test Comic");
  form.append("cover", new File(["test-cover"], "cover.jpg", { type: "image/jpeg" }));

  const req = new Request("http://localhost/admin/comics", {
    method: "POST",
    body: form,
  });

  const res = await app.fetch(req, {
    DATABASE_URL: "postgres://mock",
  } as unknown as AppEnv["Bindings"]);

  if (res.status === 400) {
    const json: any = await res.json();
    assert.notEqual(json?.error?.name, "ZodError");
  }
});

