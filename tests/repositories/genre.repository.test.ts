import assert from "node:assert/strict"
import test from "node:test"
import { sortGenres } from "../../src/repositories/genre.repository"

function genre(name: string, id = name, slug = name.toLowerCase()) {
  return { id, name, slug }
}

test("sorts genre names case-insensitively and embedded numbers naturally", () => {
  const result = sortGenres([
    genre("Genre 10"),
    genre("genre 2"),
    genre("Action"),
  ])

  assert.deepEqual(
    result.map(({ name }) => name),
    ["Action", "genre 2", "Genre 10"]
  )
})

test("preserves punctuation order and deterministically breaks collator ties", () => {
  const input = [
    genre("Genre 2+"),
    genre("Genre #2"),
    genre("Genre 2!"),
    genre("Genre 2"),
    genre("action", "lower", "action"),
    genre("Action", "upper", "action"),
  ]

  const expected = [
    "Action",
    "action",
    "Genre #2",
    "Genre 2",
    "Genre 2!",
    "Genre 2+",
  ]

  assert.deepEqual(
    sortGenres(input).map(({ name }) => name),
    expected
  )
  assert.deepEqual(
    sortGenres([...input].reverse()).map(({ name }) => name),
    expected
  )
})
