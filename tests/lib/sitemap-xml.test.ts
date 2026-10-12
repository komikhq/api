import assert from "node:assert/strict"
import test from "node:test"
import { renderSitemapUrlset } from "../../src/utils/sitemap-xml"

test("renders URL entries as escaped sitemap XML", () => {
  const xml = renderSitemapUrlset([
    {
      loc: "https://komikhq.com/komik/a&b",
      lastmod: new Date("2026-10-09T05:00:00.000Z"),
      changefreq: "daily",
      priority: "0.8",
    },
  ])

  assert.match(xml, /<loc>https:\/\/komikhq\.com\/komik\/a&amp;b<\/loc>/)
  assert.match(xml, /<lastmod>2026-10-09<\/lastmod>/)
  assert.match(xml, /<changefreq>daily<\/changefreq>/)
  assert.match(xml, /<priority>0\.8<\/priority>/)
})

test("renders an empty but valid urlset", () => {
  assert.match(
    renderSitemapUrlset([]),
    /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset[^>]*>\n<\/urlset>$/
  )
})
