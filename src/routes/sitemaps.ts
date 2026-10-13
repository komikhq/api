import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq, desc } from "drizzle-orm";
import type { AppEnv } from "@/middleware/auth";
import { createDbClient } from "@/db";
import { comics, chapters } from "@/db/schema";
import { successResponse, errorResponse } from "@/utils/response";
import { renderSitemapUrlset } from "@/utils/sitemap-xml";
import { CommonErrorResponses } from "@/schemas/common";

const SitemapXmlResponse = {
  200: {
    description: "The generated XML sitemap.",
    content: { "application/xml": { schema: z.string() } },
  },
  500: CommonErrorResponses[500],
} as const;
const SitemapDataSchema = z.unknown().openapi({ type: "object", description: "Sitemap data." });
const sitemapQuery = z.object({ limit: z.string().optional(), page: z.string().optional() });
const SitemapComicsXmlRoute = createRoute({
  method: "get",
  path: "/sitemap-comics.xml",
  tags: ["Sitemaps"],
  operationId: "getComicsXmlSitemap",
  summary: "Get the comics XML sitemap",
  description: "Returns the XML sitemap for indexed comic pages.",
  responses: SitemapXmlResponse,
});
const SitemapChaptersXmlRoute = createRoute({
  method: "get",
  path: "/sitemap-chapters.xml",
  tags: ["Sitemaps"],
  operationId: "getChaptersXmlSitemap",
  summary: "Get the chapters XML sitemap",
  description: "Returns the XML sitemap for indexed chapter pages.",
  responses: SitemapXmlResponse,
});
const SitemapComicsRoute = createRoute({
  method: "get",
  path: "/comics",
  tags: ["Sitemaps"],
  operationId: "listSitemapComics",
  summary: "List comics for sitemap generation",
  description: "Returns comic slugs and update times for XML sitemap generation.",
  request: { query: sitemapQuery },
  responses: {
    200: {
      description: "Comic sitemap entries.",
      content: {
        "application/json": {
          schema: z.object({ comics: z.array(SitemapDataSchema), total: z.number() }),
        },
      },
    },
    500: CommonErrorResponses[500],
  },
});
const SitemapChaptersRoute = createRoute({
  method: "get",
  path: "/chapters",
  tags: ["Sitemaps"],
  operationId: "listSitemapChapters",
  summary: "List chapters for sitemap generation",
  description: "Returns paginated comic chapter slugs and update times.",
  request: { query: sitemapQuery },
  responses: {
    200: {
      description: "Chapter sitemap entries.",
      content: {
        "application/json": {
          schema: z.object({
            page: z.number(),
            limit: z.number(),
            chapters: z.array(SitemapDataSchema),
            total: z.number(),
          }),
        },
      },
    },
    500: CommonErrorResponses[500],
  },
});
const SitemapSummaryRoute = createRoute({
  method: "get",
  path: "/summary",
  tags: ["Sitemaps"],
  operationId: "getSitemapSummary",
  summary: "Get sitemap update summary",
  description: "Returns the latest comic and chapter update timestamps.",
  responses: {
    200: {
      description: "Latest catalog update timestamps.",
      content: {
        "application/json": {
          schema: z.object({ latestComicUpdate: z.unknown(), latestChapterUpdate: z.unknown() }),
        },
      },
    },
    500: CommonErrorResponses[500],
  },
});

export const sitemapRoutes = new OpenAPIHono<AppEnv>();
export const sitemapXmlRoutes = new OpenAPIHono<AppEnv>();

const SITE_ORIGIN = "https://komikhq.com";
const SITEMAP_CACHE_CONTROL = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200";

sitemapXmlRoutes.openapi(SitemapComicsXmlRoute, async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL);
    const comicList = await db
      .select({ slug: comics.slug, updatedAt: comics.updatedAt })
      .from(comics)
      .orderBy(desc(comics.updatedAt))
      .limit(50000);

    const xml = renderSitemapUrlset(
      comicList.map((comic) => ({
        loc: `${SITE_ORIGIN}/komik/${encodeURIComponent(comic.slug)}`,
        lastmod: comic.updatedAt,
        changefreq: "daily",
        priority: "0.8",
      })),
    );

    return c.body(xml, 200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    });
  } catch (err: any) {
    console.error("[Sitemap API] Failed to generate comics sitemap:", err);
    return errorResponse(c, err.message || "Failed to generate comics sitemap.", 500);
  }
});

sitemapXmlRoutes.openapi(SitemapChaptersXmlRoute, async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL);
    const chapterList = await db
      .select({
        comicSlug: comics.slug,
        chapterSlug: chapters.slug,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(comics, eq(chapters.comicId, comics.id))
      .orderBy(desc(chapters.updatedAt))
      .limit(50000);

    const xml = renderSitemapUrlset(
      chapterList.map((chapter) => ({
        loc: `${SITE_ORIGIN}/komik/${encodeURIComponent(chapter.comicSlug)}/${encodeURIComponent(chapter.chapterSlug)}`,
        lastmod: chapter.updatedAt,
        changefreq: "weekly",
        priority: "0.7",
      })),
    );

    return c.body(xml, 200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    });
  } catch (err: any) {
    console.error("[Sitemap API] Failed to generate chapters sitemap:", err);
    return errorResponse(c, err.message || "Failed to generate chapters sitemap.", 500);
  }
});

// GET /v1/sitemaps/comics - Lightweight feed for sitemap XML generation
sitemapRoutes.openapi(SitemapComicsRoute, async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL);
    const { limit: queryLimit } = c.req.valid("query");
    const limit = Math.min(parseInt(queryLimit || "50000", 10), 50000);

    const comicList = await db
      .select({
        slug: comics.slug,
        updatedAt: comics.updatedAt,
      })
      .from(comics)
      .orderBy(desc(comics.updatedAt))
      .limit(limit);

    return successResponse(c, {
      comics: comicList,
      total: comicList.length,
    });
  } catch (err: any) {
    console.error("[Sitemap API] Failed to fetch comics for sitemap:", err);
    return errorResponse(c, err.message || "Failed to fetch sitemap comics.", 500);
  }
});

// GET /v1/sitemaps/chapters - Lightweight feed for all comic chapters
sitemapRoutes.openapi(SitemapChaptersRoute, async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL);
    const { page: queryPage, limit: queryLimit } = c.req.valid("query");
    const page = Math.max(parseInt(queryPage || "1", 10), 1);
    const limit = Math.min(parseInt(queryLimit || "50000", 10), 50000);
    const offset = (page - 1) * limit;

    const chapterList = await db
      .select({
        comicSlug: comics.slug,
        chapterSlug: chapters.slug,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(comics, eq(chapters.comicId, comics.id))
      .orderBy(desc(chapters.updatedAt))
      .limit(limit)
      .offset(offset);

    return successResponse(c, {
      page,
      limit,
      chapters: chapterList,
      total: chapterList.length,
    });
  } catch (err: any) {
    console.error("[Sitemap API] Failed to fetch chapters for sitemap:", err);
    return errorResponse(c, err.message || "Failed to fetch sitemap chapters.", 500);
  }
});

// GET /v1/sitemaps/summary - Overall stats for sitemap indexing
sitemapRoutes.openapi(SitemapSummaryRoute, async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL);

    const [latestComic] = await db
      .select({ updatedAt: comics.updatedAt })
      .from(comics)
      .orderBy(desc(comics.updatedAt))
      .limit(1);

    const [latestChapter] = await db
      .select({ updatedAt: chapters.updatedAt })
      .from(chapters)
      .orderBy(desc(chapters.updatedAt))
      .limit(1);

    return successResponse(c, {
      latestComicUpdate: latestComic?.updatedAt || null,
      latestChapterUpdate: latestChapter?.updatedAt || null,
    });
  } catch (err: any) {
    console.error("[Sitemap API] Failed to fetch sitemap summary:", err);
    return errorResponse(c, err.message || "Failed to fetch sitemap summary.", 500);
  }
});
