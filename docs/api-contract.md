# API Contract and OpenAPI Conventions

The canonical API reference is served at `/openapi.json`, rendered by Scalar at `/`, and also available through Swagger UI at `/docs/swagger` during evaluation. Each route module owns its OpenAPI schemas, route definitions, and handlers. The root application in `src/index.ts` mounts those modules, and `src/routes/api-docs.ts` configures the document metadata, security schemes, and API documentation UIs.

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
- Better Auth is mounted as a catch-all handler in `src/routes/auth.ts`; document its supported operations in that module when its configuration changes.

## Request and response schemas

- Reuse the `ErrorResponse`, `JsonObject`, and `Pagination` components where applicable.
- Document the successful status code, request body, and error statuses actually emitted by each handler.
- Use the route-specific response description to explain the returned data.
- `JsonObject` is intentionally extensible while legacy handlers return different response shapes. Replace it with specific response schemas as those handlers are typed and migrated; do not claim undocumented fields as guaranteed contract.
- Keep file uploads as `multipart/form-data` and describe file parts as binary strings.

## Adding or changing a route

1. Define the route's Zod request and response schemas and its `createRoute` contract in the owning route module.
2. Register the handler with `app.openapi(route, handler)` in that module. Keep authentication middleware at the module or route boundary, as appropriate.
3. Mount the module in `src/index.ts` without duplicating endpoint metadata in the API docs module.
4. Add or update OpenAPI coverage assertions in `tests/routes/docs.test.ts`.
5. Run `node --import tsx --test tests/routes/docs.test.ts`, `pnpm test`, and `pnpm typecheck`.
6. Inspect `/openapi.json` locally and confirm Swagger UI can exercise the operation with the documented inputs.

The public comic catalog is available from `GET /v1/comics` with optional filters and pagination. `GET /v1/comics/browse` remains available for clients already using the browse endpoint.
