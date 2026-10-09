import { Hono } from "hono"
import { eq, desc } from "drizzle-orm"
import type { AppEnv } from "@/middleware/auth"
import { createDbClient } from "@/db"
import { comics, chapters } from "@/db/schema"
import { successResponse, errorResponse } from "@/utils/response"
import { renderSitemapUrlset } from "@/utils/sitemap-xml"

export const sitemapRoutes = new Hono<AppEnv>()
export const sitemapXmlRoutes = new Hono<AppEnv>()

const SITE_ORIGIN = "https://komikhq.com"
const SITEMAP_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200"

sitemapXmlRoutes.get("/sitemap-comics.xml", async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL)
    const comicList = await db
      .select({ slug: comics.slug, updatedAt: comics.updatedAt })
      .from(comics)
      .orderBy(desc(comics.updatedAt))
      .limit(50000)

    const xml = renderSitemapUrlset(
      comicList.map((comic) => ({
        loc: `${SITE_ORIGIN}/komik/${encodeURIComponent(comic.slug)}`,
        lastmod: comic.updatedAt,
        changefreq: "daily",
        priority: "0.8",
      }))
    )

    return c.body(xml, 200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    })
  } catch (err: any) {
    console.error("[Sitemap API] Failed to generate comics sitemap:", err)
    return errorResponse(
      c,
      err.message || "Failed to generate comics sitemap.",
      500
    )
  }
})

sitemapXmlRoutes.get("/sitemap-chapters.xml", async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL)
    const chapterList = await db
      .select({
        comicSlug: comics.slug,
        chapterSlug: chapters.slug,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(comics, eq(chapters.comicId, comics.id))
      .orderBy(desc(chapters.updatedAt))
      .limit(50000)

    const xml = renderSitemapUrlset(
      chapterList.map((chapter) => ({
        loc: `${SITE_ORIGIN}/komik/${encodeURIComponent(chapter.comicSlug)}/${encodeURIComponent(chapter.chapterSlug)}`,
        lastmod: chapter.updatedAt,
        changefreq: "weekly",
        priority: "0.7",
      }))
    )

    return c.body(xml, 200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    })
  } catch (err: any) {
    console.error("[Sitemap API] Failed to generate chapters sitemap:", err)
    return errorResponse(
      c,
      err.message || "Failed to generate chapters sitemap.",
      500
    )
  }
})

// GET /v1/sitemaps/comics - Lightweight feed for sitemap XML generation
sitemapRoutes.get("/comics", async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL)
    const limit = Math.min(parseInt(c.req.query("limit") || "50000", 10), 50000)

    const comicList = await db
      .select({
        slug: comics.slug,
        updatedAt: comics.updatedAt,
      })
      .from(comics)
      .orderBy(desc(comics.updatedAt))
      .limit(limit)

    return successResponse(c, {
      comics: comicList,
      total: comicList.length,
    })
  } catch (err: any) {
    console.error("[Sitemap API] Failed to fetch comics for sitemap:", err)
    return errorResponse(
      c,
      err.message || "Failed to fetch sitemap comics.",
      500
    )
  }
})

// GET /v1/sitemaps/chapters - Lightweight feed for all comic chapters
sitemapRoutes.get("/chapters", async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL)
    const page = Math.max(parseInt(c.req.query("page") || "1", 10), 1)
    const limit = Math.min(parseInt(c.req.query("limit") || "50000", 10), 50000)
    const offset = (page - 1) * limit

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
      .offset(offset)

    return successResponse(c, {
      page,
      limit,
      chapters: chapterList,
      total: chapterList.length,
    })
  } catch (err: any) {
    console.error("[Sitemap API] Failed to fetch chapters for sitemap:", err)
    return errorResponse(
      c,
      err.message || "Failed to fetch sitemap chapters.",
      500
    )
  }
})

// GET /v1/sitemaps/summary - Overall stats for sitemap indexing
sitemapRoutes.get("/summary", async (c) => {
  try {
    const db = createDbClient(c.env.DATABASE_URL)

    const [latestComic] = await db
      .select({ updatedAt: comics.updatedAt })
      .from(comics)
      .orderBy(desc(comics.updatedAt))
      .limit(1)

    const [latestChapter] = await db
      .select({ updatedAt: chapters.updatedAt })
      .from(chapters)
      .orderBy(desc(chapters.updatedAt))
      .limit(1)

    return successResponse(c, {
      latestComicUpdate: latestComic?.updatedAt || null,
      latestChapterUpdate: latestChapter?.updatedAt || null,
    })
  } catch (err: any) {
    console.error("[Sitemap API] Failed to fetch sitemap summary:", err)
    return errorResponse(
      c,
      err.message || "Failed to fetch sitemap summary.",
      500
    )
  }
})
