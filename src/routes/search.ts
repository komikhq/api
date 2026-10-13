import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { ComicSearchService, type ComicSuggestion } from "@/services/comic-search.service";
import { normalizeComicSearchText } from "@/lib/comic-search";
import { errorResponse, successResponse } from "@/utils/response";
import { CommonErrorResponses } from "@/schemas/common";

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 6;
const MAX_QUERY_LENGTH = 80;
const CACHE_TTL_SECONDS = 300;

const SuggestionSchema = z
  .object({
    uuid: z.string(),
    slug: z.string(),
    title: z.string(),
    matchedTitle: z.string(),
    coverUrl: z.string().nullable(),
    type: z.string().nullable(),
    status: z.string().nullable(),
  })
  .openapi("ComicSuggestion");

const SuggestionsRoute = createRoute({
  method: "get",
  path: "/suggestions",
  tags: ["Search"],
  operationId: "getComicSearchSuggestions",
  summary: "Get comic search suggestions",
  description:
    "Returns up to six title suggestions. Queries shorter than two characters return an empty list.",
  request: {
    query: z.object({
      q: z.string().optional().openapi({ description: "Search text.", example: "solo leveling" }),
      limit: z.coerce.number().int().min(1).optional().openapi({
        description: "Maximum number of suggestions. Values are capped at six.",
        example: 6,
      }),
    }),
  },
  responses: {
    200: {
      description: "Matching comic suggestions.",
      content: {
        "application/json": {
          schema: z.object({
            query: z.string(),
            suggestions: z.array(SuggestionSchema),
          }),
        },
      },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});

type SuggestionLoader = (
  databaseUrl: string,
  query: string,
  limit: number,
  env?: any,
) => Promise<ComicSuggestion[]>;

export function createSearchRoutes(
  loadSuggestions: SuggestionLoader = (databaseUrl, query, limit, env) =>
    new ComicSearchService(databaseUrl, env).getSuggestions(query, limit),
) {
  const routes = new OpenAPIHono<AppEnv>();

  routes.openapi(SuggestionsRoute, async (c) => {
    const { q, limit: rawLimit } = c.req.valid("query");
    const query = normalizeComicSearchText(q || "");
    const queryLength = Array.from(query).length;
    if (queryLength < 2) {
      return successResponse(c, { query, suggestions: [] });
    }
    if (queryLength > MAX_QUERY_LENGTH) {
      return errorResponse(c, "Query must not exceed 80 characters.", 400);
    }

    const requestedLimit = rawLimit === undefined ? DEFAULT_LIMIT : Number(rawLimit);
    const limit = Number.isInteger(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, MAX_LIMIT))
      : DEFAULT_LIMIT;
    const cacheKey = `comic-search:suggestions:v1:${limit}:${query}`;
    let suggestions: ComicSuggestion[] | null = null;

    try {
      const cached = await c.env.KV_KOMIKHQ.get<ComicSuggestion[]>(cacheKey, "json");
      if (Array.isArray(cached)) suggestions = cached;
    } catch (err) {
      console.warn("[Search API] Suggestion cache read failed:", err);
    }

    try {
      if (!suggestions) {
        suggestions = await loadSuggestions(c.env.DATABASE_URL, query, limit, c.env);
        const cacheWrite = c.env.KV_KOMIKHQ.put(cacheKey, JSON.stringify(suggestions), {
          expirationTtl: CACHE_TTL_SECONDS,
        }).catch((err) => console.warn("[Search API] Suggestion cache write failed:", err));
        try {
          c.executionCtx.waitUntil(cacheWrite);
        } catch {
          await cacheWrite;
        }
      }

      return successResponse(c, { query, suggestions });
    } catch (err) {
      console.error("[Search API] Failed to fetch suggestions:", err);
      return errorResponse(c, "Failed to search comics.", 500);
    }
  });

  return routes;
}

export const searchRoutes = createSearchRoutes();
