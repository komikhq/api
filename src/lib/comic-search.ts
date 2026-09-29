export interface ComicSearchTitleSet {
  title: string;
  alternateTitles: string[];
}

export interface ComicSearchRankedTitle {
  score: number;
  matchedTitle: string;
}

export interface ComicSearchRankKey {
  matchScore: number;
  totalViews: number;
  updatedAt: string;
  uuid: string;
}

export function compareComicSearchRank(a: ComicSearchRankKey, b: ComicSearchRankKey): number {
  return b.matchScore - a.matchScore
    || b.totalViews - a.totalViews
    || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    || a.uuid.localeCompare(b.uuid);
}

export function normalizeComicSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\p{P}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function tokenMatchScore(queryTokens: string[], title: string): number {
  const titleTokens = normalizeComicSearchText(title).split(" ").filter(Boolean);
  if (queryTokens.every((token) => titleTokens.includes(token))) return 600;
  const everyTokenMatches = queryTokens.every((queryToken) =>
    titleTokens.some((titleToken) => titleToken === queryToken || titleToken.startsWith(queryToken)),
  );
  const hasPartialPrefix = queryTokens.some((queryToken) =>
    titleTokens.some((titleToken) => titleToken.length > queryToken.length && titleToken.startsWith(queryToken)),
  );
  if (everyTokenMatches && hasPartialPrefix) {
    return 300;
  }
  return 0;
}

export function scoreComicSearchTitle(
  query: string,
  titleSet: ComicSearchTitleSet,
): ComicSearchRankedTitle | null {
  const normalizedQuery = normalizeComicSearchText(query);
  if (!normalizedQuery) return null;

  const normalizedCanonical = normalizeComicSearchText(titleSet.title);
  const normalizedAlternates = titleSet.alternateTitles
    .map((title) => ({ title, normalized: normalizeComicSearchText(title) }))
    .filter(({ normalized }) => normalized.length > 0);

  if (normalizedCanonical === normalizedQuery) return { score: 1000, matchedTitle: titleSet.title };

  const exactAlternate = normalizedAlternates.find(({ normalized }) => normalized === normalizedQuery);
  if (exactAlternate) return { score: 900, matchedTitle: exactAlternate.title };

  if (normalizedCanonical.startsWith(normalizedQuery)) return { score: 800, matchedTitle: titleSet.title };

  const prefixAlternate = normalizedAlternates.find(({ normalized }) => normalized.startsWith(normalizedQuery));
  if (prefixAlternate) return { score: 700, matchedTitle: prefixAlternate.title };

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const canonicalTokenScore = tokenMatchScore(queryTokens, titleSet.title);
  if (canonicalTokenScore === 600) return { score: 600, matchedTitle: titleSet.title };

  for (const alternate of titleSet.alternateTitles) {
    if (tokenMatchScore(queryTokens, alternate) === 600) return { score: 500, matchedTitle: alternate };
  }

  if (canonicalTokenScore === 300) return { score: 300, matchedTitle: titleSet.title };
  for (const alternate of titleSet.alternateTitles) {
    if (tokenMatchScore(queryTokens, alternate) === 300) return { score: 300, matchedTitle: alternate };
  }

  return null;
}

export function formatComicSearchLabel(value: string | null): string | null {
  if (!value?.trim()) return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])([\p{L}\p{N}])/gu, (_, separator: string, character: string) => `${separator}${character.toUpperCase()}`);
}