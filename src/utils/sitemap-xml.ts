export interface SitemapUrlEntry {
  loc: string
  lastmod: Date | string | null
  changefreq: string
  priority: string
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    }
    return entities[character]
  })
}

function formatLastmod(value: Date | string | null): string {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10)
}

export function renderSitemapUrlset(entries: SitemapUrlEntry[]): string {
  const urlsXml = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${formatLastmod(entry.lastmod)}</lastmod>
    <changefreq>${escapeXml(entry.changefreq)}</changefreq>
    <priority>${escapeXml(entry.priority)}</priority>
  </url>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml ? `${urlsXml}\n` : ""}</urlset>`
}
