import assert from "node:assert/strict"
import test from "node:test"
import {
  toPublicUrl,
  toObjectKey,
  getPublicStorageUrl,
} from "../../src/lib/storage"

test("toObjectKey converts full URLs and relative paths correctly", () => {
  assert.equal(
    toObjectKey(
      "https://cdn-02.komikhq.dpdns.org/comics/solo-leveling/cover.webp"
    ),
    "comics/solo-leveling/cover.webp"
  )
  assert.equal(
    toObjectKey("https://cdn-01.komikhq.com/avatars/user-123.jpg"),
    "avatars/user-123.jpg"
  )
  assert.equal(
    toObjectKey("/comics/solo-leveling/cover.webp"),
    "comics/solo-leveling/cover.webp"
  )
  assert.equal(
    toObjectKey("comics/solo-leveling/cover.webp"),
    "comics/solo-leveling/cover.webp"
  )
})

test("toPublicUrl resolves relative keys with new and fallback env vars", () => {
  const envWithNew = {
    BUCKET_URL_MEDIA: "https://cdn-02.komikhq.dpdns.org",
    BUCKET_URL_USERS: "https://cdn-01.komikhq.dpdns.org",
  }

  assert.equal(
    toPublicUrl("comics/solo/cover.webp", "media", envWithNew),
    "https://cdn-02.komikhq.dpdns.org/comics/solo/cover.webp"
  )
  assert.equal(
    toPublicUrl("avatars/u1.png", "users", envWithNew),
    "https://cdn-01.komikhq.dpdns.org/avatars/u1.png"
  )

  // Fallback to legacy env vars
  const envLegacy = {
    MEDIA_BUCKET_URL: "https://cdn-02.komikhq.com",
    USERS_BUCKET_URL: "https://cdn-01.komikhq.com",
  }
  assert.equal(
    toPublicUrl("comics/solo/cover.webp", "media", envLegacy),
    "https://cdn-02.komikhq.com/comics/solo/cover.webp"
  )

  // Idempotent for full URLs
  assert.equal(
    toPublicUrl("https://legacy.com/cover.jpg", "media", envWithNew),
    "https://legacy.com/cover.jpg"
  )

  // Handles null / undefined gracefully
  assert.equal(toPublicUrl(null, "media", envWithNew), null)
  assert.equal(toPublicUrl(undefined, "media", envWithNew), null)
})
