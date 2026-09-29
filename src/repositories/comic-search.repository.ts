import { createDbClient } from "@/db";
import type { DbClient } from "@/db";
import { sql } from "drizzle-orm";

export interface ComicSuggestionRow {
  uuid: string;
  slug: string;
  title: string;
  matchedTitle: string;
  coverUrl: string | null;
  type: string | null;
  status: string | null;
}

export interface RankedComicSuggestionRow extends ComicSuggestionRow {
  matchScore: number;
  totalViews: number;
  updatedAt: string;
}

export class ComicSearchRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findSuggestions(query: string, limit: number): Promise<RankedComicSuggestionRow[]> {
    const result = await this.db.execute(sql`
      WITH search_input AS (
        SELECT
          ${query}::text AS normalized_query,
          string_to_array(${query}::text, ' ') AS query_tokens
      ), title_candidates AS (
        SELECT
          comic.id,
          comic.slug,
          comic.title AS canonical_title,
          comic.cover_url,
          comic.type,
          comic.status,
          comic.total_views,
          comic.updated_at,
          comic.title AS matched_title,
          true AS is_canonical
        FROM comics AS comic
        UNION ALL
        SELECT
          comic.id,
          comic.slug,
          comic.title AS canonical_title,
          comic.cover_url,
          comic.type,
          comic.status,
          comic.total_views,
          comic.updated_at,
          alternate.title AS matched_title,
          false AS is_canonical
        FROM comics AS comic
        CROSS JOIN LATERAL unnest(comic.alternate_titles) AS alternate(title)
      ), normalized_titles AS (
        SELECT
          candidate.*,
          input.normalized_query,
          input.query_tokens,
          trim(regexp_replace(
            regexp_replace(lower(normalize(candidate.matched_title, NFKD)), '[[:punct:]]+', ' ', 'g'),
            '[[:space:]]+', ' ', 'g'
          )) AS normalized_title
        FROM title_candidates AS candidate
        CROSS JOIN search_input AS input
      ), scored_titles AS (
        SELECT
          normalized_titles.*,
          CASE
            WHEN is_canonical AND normalized_title = normalized_query THEN 1000
            WHEN NOT is_canonical AND normalized_title = normalized_query THEN 900
            WHEN is_canonical AND left(normalized_title, char_length(normalized_query)) = normalized_query THEN 800
            WHEN NOT is_canonical AND left(normalized_title, char_length(normalized_query)) = normalized_query THEN 700
            WHEN is_canonical AND NOT EXISTS (
              SELECT 1
              FROM unnest(query_tokens) AS query_token
              WHERE NOT (query_token = ANY(string_to_array(normalized_title, ' ')))
            ) THEN 600
            WHEN NOT is_canonical AND NOT EXISTS (
              SELECT 1
              FROM unnest(query_tokens) AS query_token
              WHERE NOT (query_token = ANY(string_to_array(normalized_title, ' ')))
            ) THEN 500
            WHEN NOT EXISTS (
              SELECT 1
              FROM unnest(query_tokens) AS query_token
              WHERE NOT EXISTS (
                SELECT 1
                FROM unnest(string_to_array(normalized_title, ' ')) AS title_token
                WHERE title_token = query_token
                  OR left(title_token, char_length(query_token)) = query_token
              )
            ) AND EXISTS (
              SELECT 1
              FROM unnest(query_tokens) AS query_token
              WHERE EXISTS (
                SELECT 1
                FROM unnest(string_to_array(normalized_title, ' ')) AS title_token
                WHERE char_length(title_token) > char_length(query_token)
                  AND left(title_token, char_length(query_token)) = query_token
              )
            ) THEN 300
            ELSE 0
          END AS match_score
        FROM normalized_titles
      ), best_title_per_comic AS (
        SELECT
          scored_titles.*,
          row_number() OVER (
            PARTITION BY id
            ORDER BY match_score DESC, is_canonical DESC, matched_title ASC
          ) AS title_rank
        FROM scored_titles
        WHERE match_score > 0
      )
      SELECT
        id::text AS uuid,
        slug,
        canonical_title AS title,
        matched_title AS "matchedTitle",
        cover_url AS "coverUrl",
        type,
        status,
        match_score AS "matchScore",
        total_views AS "totalViews",
        updated_at::text AS "updatedAt"
      FROM best_title_per_comic
      WHERE title_rank = 1
      ORDER BY match_score DESC, total_views DESC, updated_at DESC, id ASC
      LIMIT ${limit}
    `);

    return result.rows.map((row) => ({
      uuid: String(row.uuid),
      slug: String(row.slug),
      title: String(row.title),
      matchedTitle: String(row.matchedTitle),
      coverUrl: typeof row.coverUrl === "string" ? row.coverUrl : null,
      type: typeof row.type === "string" ? row.type : null,
      status: typeof row.status === "string" ? row.status : null,
      matchScore: Number(row.matchScore),
      totalViews: Number(row.totalViews),
      updatedAt: String(row.updatedAt),
    }));
  }
}