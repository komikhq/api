# API Contract and OpenAPI Conventions

The canonical API reference is served at `/openapi.json` and rendered by Swagger UI at `/`. Keep the OpenAPI contract in `src/routes/api-docs.ts` synchronized with the runtime handlers and mounts in `src/index.ts` and `src/routes/`.

## Naming and organization

- Write operation summaries, descriptions, tag descriptions, and schema descriptions in English.
- Assign each operation to a stable, user-facing tag and give it a unique `operationId`.
- Use the existing URL paths and HTTP methods. Do not change runtime behavior solely to match the documentation.
- Represent path parameters with OpenAPI braces, such as `/v1/comics/{slug}`.
- Describe query parameters with their types, allowed values, and pagination constraints where known.
- Document JSON, multipart form, URL-encoded, XML, and WebSocket inputs or outputs using their actual media types.

## Authentication and authorization

- Public operations omit a security requirement.
- Operations that require a signed-in user declare the session cookie and bearer token as alternative security schemes.
- Administrator operations use the same session mechanisms and state the administrator role requirement in their descriptions.
- Better Auth is mounted as a catch-all handler. Its configured core operations are listed explicitly; if authentication configuration or plugins add operations, update this catalog and its tests.

## Request and response schemas

- Reuse the `ErrorResponse`, `JsonObject`, and `Pagination` components where applicable.
- Document the successful status code, request body, and error statuses actually emitted by each handler.
- Use the route-specific response description to explain the returned data.
- `JsonObject` is intentionally extensible while legacy handlers return different response shapes. Replace it with specific response schemas as those handlers are typed and migrated; do not claim undocumented fields as guaranteed contract.
- Keep file uploads as `multipart/form-data` and describe file parts as binary strings.

## Adding or changing a route

1. Update the runtime route handler and its mount.
2. Add or update the matching operation in `src/routes/api-docs.ts`, including parameters, body, access requirements, status codes, and English descriptions.
3. Run `node --import tsx --test tests/routes/docs.test.ts`, `pnpm test`, and `pnpm typecheck`.
4. Inspect `/openapi.json` locally and confirm Swagger UI can exercise the operation with the documented inputs.
