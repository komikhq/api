import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { successResponse } from "@/utils/response";

export const comicRoutes = new Hono<AppEnv>();

comicRoutes.get("/trending", async (c) => {
  const cachedTrending = await c.env.KV_KOMIKHQ.get("cache:trending", "json");
  if (cachedTrending) {
    return c.json(cachedTrending);
  }

  return successResponse(c, [
    { comicId: "c1", title: "One Piece", slug: "one-piece", views: 15400 },
    { comicId: "c2", title: "Solo Leveling", slug: "solo-leveling", views: 12100 },
  ]);
});

comicRoutes.get("/browse", async (c) => {
  const search = c.req.query("search");
  const genre = c.req.query("genre");
  const status = c.req.query("status");

  return successResponse(c, {
    query: { search, genre, status },
    items: [],
    total: 0,
  });
});
