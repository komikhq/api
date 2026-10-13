import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { ComicService } from "@/services/comic.service";
import { ChapterService } from "@/services/chapter.service";
import { successResponse, errorResponse } from "@/utils/response";
import { CommonErrorResponses } from "@/schemas/common";

const ComicDataSchema = z
  .unknown()
  .openapi({ type: "object", description: "Comic response data." });
const ComicListQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  genre: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  sort: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
const TrendingRoute = createRoute({
  method: "get",
  path: "/trending",
  tags: ["Comics"],
  operationId: "listTrendingComics",
  summary: "List trending comics",
  description: "Returns daily, weekly, or all-time popular comics.",
  request: { query: z.object({ period: z.string().optional(), limit: z.string().optional() }) },
  responses: {
    200: {
      description: "Trending comics and the selected period.",
      content: {
        "application/json": {
          schema: z.object({ period: z.string(), comics: z.array(z.unknown()), total: z.number() }),
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
const ListComicsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Comics"],
  operationId: "listComics",
  summary: "List comics",
  description: "Returns the public comic catalog with optional filters and pagination.",
  request: { query: ComicListQuerySchema },
  responses: {
    200: {
      description: "The matching comics and pagination metadata.",
      content: {
        "application/json": {
          schema: z.object({
            query: z.unknown(),
            comics: z.array(z.unknown()),
            pagination: z.unknown(),
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
const BrowseComicsRoute = createRoute({
  method: "get",
  path: "/browse",
  tags: ["Comics"],
  operationId: "browseComics",
  summary: "Browse and search comics",
  description: "Filters the public comic catalog and returns paginated results.",
  request: { query: ComicListQuerySchema },
  responses: {
    200: {
      description: "The matching comics and pagination metadata.",
      content: {
        "application/json": {
          schema: z.object({
            query: z.unknown(),
            comics: z.array(z.unknown()),
            pagination: z.unknown(),
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
const GetPublicChapterRoute = createRoute({
  method: "get",
  path: "/{slug}/chapters/{chapterSlug}",
  tags: ["Chapters"],
  operationId: "getPublicChapter",
  summary: "Get a public comic chapter",
  description: "Returns chapter reader data for the specified comic and chapter slugs.",
  request: { params: z.object({ slug: z.string(), chapterSlug: z.string() }) },
  responses: {
    200: {
      description: "The chapter and reader data.",
      content: { "application/json": { schema: ComicDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const GetComicRoute = createRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Comics"],
  operationId: "getComicBySlug",
  summary: "Get a comic by slug",
  description: "Returns public comic details for the specified slug.",
  request: { params: z.object({ slug: z.string() }) },
  responses: {
    200: {
      description: "Comic details.",
      content: { "application/json": { schema: ComicDataSchema } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});

export const comicRoutes = new OpenAPIHono<AppEnv>();

// GET /v1/comics - List comics with optional filters and pagination
comicRoutes.openapi(ListComicsRoute, async (c) => {
  try {
    const query = c.req.valid("query");
    const search = query.search || query.q || "";
    const genre = query.genre || "";
    const status = query.status || "";
    const type = query.type || "";
    const sort = query.sort || "";
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "20", 10);

    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const result = await service.getComicsList({
      q: search,
      genre,
      status,
      type,
      sort,
      page,
      limit,
    });

    return successResponse(c, {
      query: { search, genre, status, type, sort },
      comics: result.comics,
      pagination: result.pagination,
    });
  } catch (err: any) {
    console.error("[Public API] Failed to list comics:", err);
    return errorResponse(c, err.message || "Failed to fetch comics.", 500);
  }
});

// GET /v1/comics/trending - Get trending / featured comics (period: daily, weekly, popular)
comicRoutes.openapi(TrendingRoute, async (c) => {
  try {
    const { period: queryPeriod, limit: queryLimit } = c.req.valid("query");
    const periodParam = queryPeriod || "daily";
    const period = (
      ["daily", "weekly", "popular"].includes(periodParam) ? periodParam : "daily"
    ) as "daily" | "weekly" | "popular";
    const limit = parseInt(queryLimit || "20", 10);

    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const result = await service.getTrendingComics(period, limit);
    return successResponse(c, {
      period,
      comics: result.comics,
      total: result.total,
    });
  } catch (err: any) {
    console.error("[Public API] Failed to fetch trending comics:", err);
    return successResponse(c, { period: "daily", comics: [], total: 0 });
  }
});

// GET /v1/comics/browse - Browse & search comics with filters
comicRoutes.openapi(BrowseComicsRoute, async (c) => {
  try {
    const query = c.req.valid("query");
    const search = query.search || query.q || "";
    const genre = query.genre || "";
    const status = query.status || "";
    const type = query.type || "";
    const sort = query.sort || "";
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "20", 10);

    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const result = await service.getComicsList({
      q: search,
      genre,
      status,
      type,
      sort,
      page,
      limit,
    });

    return successResponse(c, {
      query: { search, genre, status, type, sort },
      comics: result.comics,
      pagination: result.pagination,
    });
  } catch (err: any) {
    console.error("[Public API] Failed to fetch browse comics:", err);
    return successResponse(c, {
      query: {},
      comics: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });
  }
});

// GET /v1/comics/:slug/chapters/:chapterSlug - Public chapter detail & reader pages
comicRoutes.openapi(GetPublicChapterRoute, async (c) => {
  try {
    const { slug: comicSlug, chapterSlug } = c.req.valid("param");

    const chapterService = new ChapterService(c.env.DATABASE_URL, c.env);
    const data = await chapterService.getPublicChapterBySlugs(comicSlug, chapterSlug);

    return successResponse(c, data);
  } catch (err: any) {
    return errorResponse(c, err.message || "Chapter not found.", 404);
  }
});

// GET /v1/comics/:slug - Get single comic details by slug
comicRoutes.openapi(GetComicRoute, async (c) => {
  try {
    const { slug } = c.req.valid("param");
    const service = new ComicService(c.env.DATABASE_URL, c.env);
    const comicData = await service.getComicBySlug(slug);

    return successResponse(c, comicData);
  } catch (err: any) {
    return errorResponse(c, err.message || "Comic not found.", 404);
  }
});
