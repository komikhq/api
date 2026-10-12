import { Hono } from "hono"
import type { AppEnv } from "@/middleware/auth"
import {
  ComicSearchService,
  type ComicSuggestion,
} from "@/services/comic-search.service"
import { normalizeComicSearchText } from "@/lib/comic-search"
import { errorResponse, successResponse } from "@/utils/response"

const DEFAULT_LIMIT = 6
const MAX_LIMIT = 6
const MAX_QUERY_LENGTH = 80
const CACHE_TTL_SECONDS = 300

type SuggestionLoader = (
  databaseUrl: string,
  query: string,
  limit: number,
  env?: any
) => Promise<ComicSuggestion[]>

export function createSearchRoutes(
  loadSuggestions: SuggestionLoader = (databaseUrl, query, limit, env) =>
    new ComicSearchService(databaseUrl, env).getSuggestions(query, limit)
) {
  const routes = new Hono<AppEnv>()

  routes.get("/suggestions", async (c) => {
    const query = normalizeComicSearchText(c.req.query("q") || "")
    const queryLength = Array.from(query).length
    if (queryLength < 2) {
      return successResponse(c, { query, suggestions: [] })
    }
    if (queryLength > MAX_QUERY_LENGTH) {
      return errorResponse(c, "Query must not exceed 80 characters.", 400)
    }

    const rawLimit = c.req.query("limit")
    const requestedLimit =
      rawLimit === undefined ? DEFAULT_LIMIT : Number(rawLimit)
    const limit = Number.isInteger(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, MAX_LIMIT))
      : DEFAULT_LIMIT
    const cacheKey = `comic-search:suggestions:v1:${limit}:${query}`
    let suggestions: ComicSuggestion[] | null = null

    try {
      const cached = await c.env.KV_KOMIKHQ.get<ComicSuggestion[]>(
        cacheKey,
        "json"
      )
      if (Array.isArray(cached)) suggestions = cached
    } catch (err) {
      console.warn("[Search API] Suggestion cache read failed:", err)
    }

    try {
      if (!suggestions) {
        suggestions = await loadSuggestions(
          c.env.DATABASE_URL,
          query,
          limit,
          c.env
        )
        const cacheWrite = c.env.KV_KOMIKHQ.put(
          cacheKey,
          JSON.stringify(suggestions),
          { expirationTtl: CACHE_TTL_SECONDS }
        ).catch((err) =>
          console.warn("[Search API] Suggestion cache write failed:", err)
        )
        try {
          c.executionCtx.waitUntil(cacheWrite)
        } catch {
          await cacheWrite
        }
      }

      return successResponse(c, { query, suggestions })
    } catch (err) {
      console.error("[Search API] Failed to fetch suggestions:", err)
      return errorResponse(c, "Failed to search comics.", 500)
    }
  })

  return routes
}

export const searchRoutes = createSearchRoutes()
