import { createDbClient, comics } from "../db";
import { sql } from "drizzle-orm";
import type { AppEnv } from "../middleware/auth";

export async function processBatchViews(env: AppEnv["Bindings"]) {
  if (!env.DATABASE_URL) return;

  const db = createDbClient(env.DATABASE_URL);
  const listResult = await env.KV_KOMIKHQ.list({ prefix: "view:" });

  if (listResult.keys.length === 0) return;

  for (const keyObj of listResult.keys) {
    const key = keyObj.name;
    const parts = key.split(":");
    if (parts.length < 3) continue;

    const comicId = parts[1];
    const viewsCountStr = await env.KV_KOMIKHQ.get(key);
    const viewsToAdd = parseInt(viewsCountStr || "0", 10);

    if (viewsToAdd > 0) {
      // Execute 1 SQL batch update per comic
      await db
        .update(comics)
        .set({ totalViews: sql`${comics.totalViews} + ${viewsToAdd}` })
        .where(sql`${comics.id} = ${comicId}`);

      // Reset KV buffer key
      await env.KV_KOMIKHQ.delete(key);
    }
  }
}
