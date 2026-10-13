import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { syncViewsDelta } from "@/cron/sync-views-delta";
import { refreshRankings } from "@/cron/refresh-rankings";
import { successResponse, errorResponse } from "@/utils/response";
import { AdminSecurity, CommonErrorResponses } from "@/schemas/common";

const MaintenanceStatusRoute = createRoute({
  method: "get",
  path: "/system/maintenance-status",
  tags: ["Administration"],
  operationId: "getSystemMaintenanceStatus",
  summary: "Get system maintenance status",
  description:
    "Returns KV, analytics, storage, and synchronization status. Requires administrator access.",
  security: AdminSecurity,
  responses: {
    200: {
      description: "Current maintenance status.",
      content: { "application/json": { schema: z.unknown().openapi({ type: "object" }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const SyncViewsRoute = createRoute({
  method: "post",
  path: "/system/sync-views",
  tags: ["Administration"],
  operationId: "synchronizeViewCounts",
  summary: "Synchronize view counts",
  description: "Synchronizes view deltas and refreshes rankings. Requires administrator access.",
  security: AdminSecurity,
  responses: {
    200: {
      description: "View counts and rankings were synchronized.",
      content: { "application/json": { schema: z.unknown().openapi({ type: "object" }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const ClearSearchCacheRoute = createRoute({
  method: "post",
  path: "/system/clear-search-cache",
  tags: ["Administration"],
  operationId: "clearSearchSuggestionCache",
  summary: "Clear the search suggestion cache",
  description: "Invalidates cached comic search suggestions. Requires administrator access.",
  security: AdminSecurity,
  responses: {
    200: {
      description: "Search suggestion cache was cleared.",
      content: { "application/json": { schema: z.unknown().openapi({ type: "object" }) } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});

export const adminSystemRoutes = new OpenAPIHono<AppEnv>();

adminSystemRoutes.use("*", requireAdmin);

// GET /v1/admin/system/maintenance-status - Get live metrics for KV queues & storage
adminSystemRoutes.openapi(MaintenanceStatusRoute, async (c) => {
  try {
    let cachedSearchKeysCount = 0;
    let kvHealthy = true;
    let kvViewsHealthy = true;
    let aeHealthy = Boolean(c.env.AE_COMIC_VIEWS);
    let r2Healthy = true;
    let lastSyncedAt: string | null = null;
    let cachedRankingsCount = 0;

    if (c.env.KV_KOMIKHQ) {
      try {
        const searchKeys = await c.env.KV_KOMIKHQ.list({
          prefix: "comic-search:suggestions:",
        });
        cachedSearchKeysCount = searchKeys.keys.length;
      } catch {
        kvHealthy = false;
      }
    } else {
      kvHealthy = false;
    }

    if (c.env.KV_VIEWS) {
      try {
        lastSyncedAt = await c.env.KV_VIEWS.get("views_sync:last_synced_at");
        const rankingKeys = await c.env.KV_VIEWS.list({ prefix: "ranking:" });
        cachedRankingsCount = rankingKeys.keys.length;
      } catch {
        kvViewsHealthy = false;
      }
    } else {
      kvViewsHealthy = false;
    }

    const bucket = c.env.BUCKET_MEDIA || c.env.MEDIA_BUCKET;
    if (!bucket) {
      r2Healthy = false;
    }

    return successResponse(c, {
      "cached-search-keys-count": cachedSearchKeysCount,
      "kv-healthy": kvHealthy,
      "kv-views-healthy": kvViewsHealthy,
      "ae-healthy": aeHealthy,
      "last-synced-at": lastSyncedAt,
      "cached-rankings-count": cachedRankingsCount,
      "r2-healthy": r2Healthy,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to retrieve maintenance status.", 500);
  }
});

// POST /v1/admin/system/sync-views - Force sync view deltas & refresh rankings
adminSystemRoutes.openapi(SyncViewsRoute, async (c) => {
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
adminSystemRoutes.openapi(ClearSearchCacheRoute, async (c) => {
  try {
    if (!c.env.KV_KOMIKHQ) {
      return errorResponse(c, "KV_KOMIKHQ binding is not available.", 500);
    }

    let clearedKeys = 0;
    let truncated = true;
    let cursor: string | undefined = undefined;

    while (truncated) {
      const listRes: {
        keys: { name: string }[];
        list_complete?: boolean;
        cursor?: string;
      } = await c.env.KV_KOMIKHQ.list({
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
