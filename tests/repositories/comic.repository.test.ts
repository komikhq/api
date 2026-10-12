import assert from "node:assert/strict"
import test from "node:test"
import { attachPeriodViews } from "../../src/repositories/comic.repository"

test("attaches period counts without changing ranking order or lifetime views", () => {
  const rankedComics = [
    { id: "comic-b", totalViews: 900 },
    { id: "comic-a", totalViews: 120 },
  ]

  const result = attachPeriodViews(
    rankedComics,
    new Map([
      ["comic-b", 8],
      ["comic-a", 3],
    ])
  )

  assert.deepEqual(result, [
    { id: "comic-b", totalViews: 900, periodViews: 8 },
    { id: "comic-a", totalViews: 120, periodViews: 3 },
  ])
})

test("period counts can differ independently for each trending window", () => {
  const rankedComics = [{ id: "comic-a", totalViews: 120 }]

  const daily = attachPeriodViews(rankedComics, new Map([["comic-a", 2]]))
  const weekly = attachPeriodViews(rankedComics, new Map([["comic-a", 11]]))

  assert.equal(daily[0].periodViews, 2)
  assert.equal(weekly[0].periodViews, 11)
})

test("popular comics keep lifetime views without a period count", () => {
  const popular = attachPeriodViews([{ id: "comic-a", totalViews: 120 }], null)

  assert.deepEqual(popular, [{ id: "comic-a", totalViews: 120 }])
})
