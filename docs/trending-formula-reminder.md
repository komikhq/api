# Developer Reminder: Keep Trending Metrics Period-Specific

## Metric Contract

- `popular` ranks by lifetime `totalViews` and displays `totalViews`.
- `daily` ranks by view logs from the last 24 hours and displays `periodViews`.
- `weekly` ranks by view logs from the last 7 days and displays `periodViews`.
- `totalViews` remains the lifetime metric for existing consumers; do not redefine it.

## Data Flow

1. `comic_view_logs.viewed_at` is filtered to the selected time window.
2. The API groups those logs by comic and sorts by the resulting count.
3. The API returns that same aggregate as `periodViews` for daily and weekly results.
4. The frontend renders the API metric: `periodViews` for daily/weekly and `totalViews` for Popular.

An empty daily or weekly window returns an empty `comics` array. Never backfill trending with lifetime popularity.

## Guardrails

- Do not calculate trending counts in the frontend.
- Do not display `totalViews` in daily or weekly trending cards.
- Preserve aggregate ranking order when enriching comic objects.
- Keep Popular on `totalViews`; do not add period counts to its meaning.
- Keep tests under `tests/`, not under production `src/`.

## Tests

This API uses Node's built-in test runner with the existing `tsx` loader; no separate test framework is required.

```sh
pnpm test
pnpm test:watch
pnpm typecheck
```

Add test files as `tests/**/*.test.ts`, using `node:test` and `node:assert/strict`. For HTTP route tests, use Hono's in-memory `app.request()` API so tests do not need a network listener or deployed Worker. Keep repository tests focused on ranking order, selected time windows, attached period counts, empty results, and Popular's lifetime metric.
