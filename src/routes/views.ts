import { Hono } from "hono";
import type { AppEnv } from "../middleware/auth";

export const viewRoutes = new Hono<AppEnv>();

viewRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const { comicId, chapterId } = body;

  if (!comicId || !chapterId) {
    return c.json({ error: "comicId and chapterId are required" }, 400);
  }

  const key = `view:${comicId}:${chapterId}`;

  // Increment view counter in single KV_KOMIKHQ namespace (< 1ms CPU, zero DB write)
  const currentStr = await c.env.KV_KOMIKHQ.get(key);
  const current = parseInt(currentStr || "0", 10);
  await c.env.KV_KOMIKHQ.put(key, (current + 1).toString());

  return c.json({ success: true, bufferedViews: current + 1 });
});
