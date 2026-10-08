import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { syncViewsDelta } from "@/cron/sync-views-delta";
import { refreshRankings } from "@/cron/refresh-rankings";
import { successResponse, errorResponse } from "@/utils/response";

export const adminSystemRoutes = new Hono<AppEnv>();

adminSystemRoutes.use("*", requireAdmin());

// GET /v1/admin/system/maintenance-status - Get live metrics for KV queues & storage
adminSystemRoutes.get("/system/maintenance-status", async (c) => {
  try {
    let pendingViewsCount = 0;
    let cachedSearchKeysCount = 0;
    let kvHealthy = true;
    let r2Healthy = true;

    if (c.env.KV_KOMIKHQ) {
      try {
        const viewLogs = await c.env.KV_KOMIKHQ.list({ prefix: "view_log:" });
        const legacyViews = await c.env.KV_KOMIKHQ.list({ prefix: "view:" });
        pendingViewsCount = viewLogs.keys.length + legacyViews.keys.length;

        const searchKeys = await c.env.KV_KOMIKHQ.list({ prefix: "comic-search:suggestions:" });
        cachedSearchKeysCount = searchKeys.keys.length;
      } catch {
        kvHealthy = false;
      }
    } else {
      kvHealthy = false;
    }

    const bucket = c.env.BUCKET_MEDIA || c.env.MEDIA_BUCKET;
    if (!bucket) {
      r2Healthy = false;
    }

    return successResponse(c, {
      "pending-views-count": pendingViewsCount,
      "cached-search-keys-count": cachedSearchKeysCount,
      "kv-healthy": kvHealthy,
      "r2-healthy": r2Healthy,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to retrieve maintenance status.", 500);
  }
});

// POST /v1/admin/system/sync-views - Force sync view deltas & refresh rankings
adminSystemRoutes.post("/system/sync-views", async (c) => {
  try {
    const syncResult = await syncViewsDelta(c.env);
    const rankingResult = await refreshRankings(c.env);

    return successResponse(c, {
      success: true,
      message: `Successfully synchronized ${syncResult.syncedChapters} chapters across ${syncResult.syncedComics} comics (${syncResult.totalViewsAdded} views). Rankings refreshed.`,
      "synced-chapters": syncResult.syncedChapters,
      "synced-comics": syncResult.syncedComics,
      "total-views-added": syncResult.totalViewsAdded,
      "synced-logs": syncResult.totalViewsAdded,
      "affected-comics": syncResult.syncedComics,
      rankings: rankingResult,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to synchronize views.", 500);
  }
});

// POST /v1/admin/system/clear-search-cache - Invalidate search suggestions cache in KV
adminSystemRoutes.post("/system/clear-search-cache", async (c) => {
  try {
    if (!c.env.KV_KOMIKHQ) {
      return errorResponse(c, "KV_KOMIKHQ binding is not available.", 500);
    }

    let clearedKeys = 0;
    let truncated = true;
    let cursor: string | undefined = undefined;

    while (truncated) {
      const listRes: { keys: { name: string }[]; list_complete?: boolean; cursor?: string } =
        await c.env.KV_KOMIKHQ.list({
          prefix: "comic-search:suggestions:",
          cursor,
        });
      truncated = listRes.list_complete ? false : Boolean(listRes.cursor);
      cursor = listRes.cursor;

      for (const key of listRes.keys) {
        await c.env.KV_KOMIKHQ.delete(key.name);
        clearedKeys++;
      }

      if (!listRes.cursor) {
        break;
      }
    }

    return successResponse(c, {
      success: true,
      message: `Search suggestion cache invalidated successfully (${clearedKeys} cached queries cleared).`,
      "cleared-keys": clearedKeys,
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to clear search cache.", 500);
  }
});
