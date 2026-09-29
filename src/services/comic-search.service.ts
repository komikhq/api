import { ComicSearchRepository } from "@/repositories/comic-search.repository";
import { compareComicSearchRank, formatComicSearchLabel } from "@/lib/comic-search";

export interface ComicSuggestion {
  uuid: string;
  slug: string;
  title: string;
  matchedTitle: string;
  coverUrl: string | null;
  type: string | null;
  status: string | null;
}

export class ComicSearchService {
  private repository: ComicSearchRepository;

  constructor(databaseUrl: string) {
    this.repository = new ComicSearchRepository(databaseUrl);
  }

  async getSuggestions(query: string, limit: number): Promise<ComicSuggestion[]> {
    const rows = await this.repository.findSuggestions(query, limit);
    return rows
      .sort(compareComicSearchRank)
      .map(({ matchScore: _matchScore, totalViews: _totalViews, updatedAt: _updatedAt, ...row }) => ({
        ...row,
        type: formatComicSearchLabel(row.type),
        status: formatComicSearchLabel(row.status),
      }));
  }
}