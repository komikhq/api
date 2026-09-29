# Public Genre API Ordering

`GET /v1/genres` is a public catalog endpoint. It returns the existing `{ "genres": [...] }` response shape, preserving each genre's `id` and `slug` for consumers such as Browse filters.

Genres are ordered by name with a fixed English `Intl.Collator` using numeric comparison, base sensitivity, and punctuation enabled. This makes comparison case-insensitive and natural for embedded numbers, so `Genre 2` comes before `Genre 10`.

If two names compare equally with the collator, the API breaks ties by NFKC-normalized Unicode code-point order, then original name, slug, and ID in Unicode code-point order. Punctuation and symbols are not stripped. This gives repeated requests a stable order independent of creation timestamps.

Keep the endpoint public without changing authorization for private or admin routes. Do not change the response envelope or replace genre slugs used by clients.