import { ComicSearchRepository } from "@/repositories/comic-search.repository"
import {
  compareComicSearchRank,
  formatComicSearchLabel,
} from "@/lib/comic-search"
import { toPublicUrl } from "@/lib/storage"

export interface ComicSuggestion {
  uuid: string
  slug: string
  title: string
  matchedTitle: string
  coverUrl: string | null
  type: string | null
  status: string | null
}

export class ComicSearchService {
  private repository: ComicSearchRepository
  private env: any

  constructor(databaseUrl: string, env?: any) {
    this.repository = new ComicSearchRepository(databaseUrl)
    this.env = env
  }

  async getSuggestions(
    query: string,
    limit: number
  ): Promise<ComicSuggestion[]> {
    const rows = await this.repository.findSuggestions(query, limit)
    return rows
      .sort(compareComicSearchRank)
      .map(
        ({
          matchScore: _matchScore,
          totalViews: _totalViews,
          updatedAt: _updatedAt,
          ...row
        }) => ({
          ...row,
          coverUrl: this.env
            ? toPublicUrl(row.coverUrl, "media", this.env)
            : row.coverUrl,
          type: formatComicSearchLabel(row.type),
          status: formatComicSearchLabel(row.status),
        })
      )
  }
}
