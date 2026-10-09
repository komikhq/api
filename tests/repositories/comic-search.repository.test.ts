import assert from "node:assert/strict"
import test from "node:test"
import {
  compareComicSearchRank,
  normalizeComicSearchText,
  scoreComicSearchTitle,
} from "../../src/lib/comic-search"

test("normalizes Unicode titles and punctuation into searchable tokens", () => {
  assert.equal(
    normalizeComicSearchText("  Café—SOLO   Leveling! "),
    "cafe\u0301 solo leveling"
  )
  assert.equal(
    normalizeComicSearchText("나 혼자만 레벨업"),
    "나 혼자만 레벨업".normalize("NFKD")
  )
})

test("scores each canonical and alternate-title ranking tier", () => {
  const cases = [
    {
      query: "solo leveling",
      title: "Solo Leveling",
      alternateTitles: [],
      score: 1000,
    },
    {
      query: "solo leveling",
      title: "Other Comic",
      alternateTitles: ["Solo Leveling"],
      score: 900,
    },
    {
      query: "solo lev",
      title: "Solo Leveling",
      alternateTitles: [],
      score: 800,
    },
    {
      query: "solo lev",
      title: "Other Comic",
      alternateTitles: ["Solo Leveling"],
      score: 700,
    },
    {
      query: "leveling solo",
      title: "Solo Leveling",
      alternateTitles: [],
      score: 600,
    },
    {
      query: "leveling solo",
      title: "Other Comic",
      alternateTitles: ["Solo Leveling"],
      score: 500,
    },
    {
      query: "lev sol",
      title: "Solo Leveling",
      alternateTitles: [],
      score: 300,
    },
  ]

  for (const item of cases) {
    const match = scoreComicSearchTitle(item.query, item)
    assert.equal(
      match?.score,
      item.score,
      `${item.query} against ${item.title}`
    )
  }
})

test("returns the actual alternate title that matched", () => {
  const match = scoreComicSearchTitle("manhwa name", {
    title: "Canonical Comic",
    alternateTitles: ["Manga Name", "Manhwa Name"],
  })

  assert.deepEqual(match, { score: 900, matchedTitle: "Manhwa Name" })
})

test("does not fuzzy-match misspelled tokens", () => {
  assert.equal(
    scoreComicSearchTitle("slo leveling", {
      title: "Solo Leveling",
      alternateTitles: [],
    }),
    null
  )
})

test("orders ties by popularity, update recency, then UUID after text score", () => {
  const candidates = [
    {
      matchScore: 800,
      totalViews: 1,
      updatedAt: "2026-01-01T00:00:00.000Z",
      uuid: "d",
    },
    {
      matchScore: 900,
      totalViews: 1,
      updatedAt: "2026-01-01T00:00:00.000Z",
      uuid: "z",
    },
    {
      matchScore: 900,
      totalViews: 30,
      updatedAt: "2026-01-01T00:00:00.000Z",
      uuid: "c",
    },
    {
      matchScore: 900,
      totalViews: 30,
      updatedAt: "2026-03-01T00:00:00.000Z",
      uuid: "b",
    },
    {
      matchScore: 900,
      totalViews: 30,
      updatedAt: "2026-03-01T00:00:00.000Z",
      uuid: "a",
    },
  ]

  assert.deepEqual(
    candidates.sort(compareComicSearchRank).map(({ uuid }) => uuid),
    ["a", "b", "c", "z", "d"]
  )
})
