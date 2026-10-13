import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, type OpenAPIHono, type RouteConfig, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";

const jsonObjectSchema = z.object({}).passthrough().openapi("JsonObject");
const errorResponseSchema = z
  .object({
    error: z.string().optional().openapi({ example: "Request failed." }),
    message: z.string().optional().openapi({ example: "Request failed." }),
    code: z.string().optional(),
    details: z.unknown().optional(),
  })
  .passthrough()
  .openapi("ErrorResponse");
const paginationSchema = z
  .object({
    page: z.number().int().openapi({ example: 1 }),
    limit: z.number().int().openapi({ example: 20 }),
    total: z.number().int().openapi({ example: 100 }),
    totalPages: z.number().int().openapi({ example: 5 }),
  })
  .openapi("Pagination");
const uploadedFileSchema = z.file().openapi({ type: "string", format: "binary" });

const errorResponse = {
  description: "The request could not be completed.",
  content: {
    "application/json": {
      schema: errorResponseSchema,
    },
  },
} as const;

const commonErrors = {
  400: errorResponse,
  401: {
    ...errorResponse,
    description: "Authentication is required or the supplied credentials are invalid.",
  },
  403: {
    ...errorResponse,
    description: "The authenticated user is not allowed to perform this operation.",
  },
  404: {
    ...errorResponse,
    description: "The requested resource was not found.",
  },
  409: {
    ...errorResponse,
    description: "The request conflicts with the current resource state.",
  },
  500: {
    ...errorResponse,
    description: "An unexpected server error occurred.",
  },
} as const;

type HttpMethod = "get" | "post" | "put" | "delete";
type SuccessStatus = 200 | 201 | 101;
type ErrorStatus = keyof typeof commonErrors;

interface EndpointDefinition {
  method: HttpMethod;
  path: string;
  tag: string;
  summary: string;
  description: string;
  successStatus?: SuccessStatus;
  successDescription?: string;
  params?: Record<string, z.ZodType>;
  query?: Record<string, z.ZodType>;
  body?: z.ZodType;
  bodyOptional?: boolean;
  bodyContentType?:
    "application/json" | "multipart/form-data" | "application/x-www-form-urlencoded";
  authenticated?: boolean;
  adminOnly?: boolean;
  errorStatuses?: ErrorStatus[];
  xmlResponse?: boolean;
  webSocket?: boolean;
}

function defineEndpoint(endpoint: EndpointDefinition): RouteConfig {
  const successStatus = endpoint.successStatus ?? 200;
  const successResponse: NonNullable<RouteConfig["responses"]> =
    successStatus === 101
      ? {
          101: {
            description: "The request was upgraded to a WebSocket connection.",
          },
        }
      : successStatus === 201
        ? {
            201: {
              description: endpoint.successDescription ?? "The resource was created.",
              content: {
                "application/json": {
                  schema: jsonObjectSchema,
                },
              },
            },
          }
        : endpoint.xmlResponse
          ? {
              200: {
                description: endpoint.successDescription ?? "The requested XML document.",
                content: {
                  "application/xml": {
                    schema: z.string(),
                  },
                },
              },
            }
          : {
              200: {
                description: endpoint.successDescription ?? "The request completed successfully.",
                content: {
                  "application/json": {
                    schema: jsonObjectSchema,
                  },
                },
              },
            };

  const errorStatuses =
    endpoint.errorStatuses ??
    (endpoint.adminOnly
      ? ([400, 401, 403, 404, 500] as const)
      : endpoint.authenticated
        ? ([400, 401, 404, 500] as const)
        : ([400, 404, 500] as const));
  const errors = Object.fromEntries(errorStatuses.map((status) => [status, commonErrors[status]]));
  const params =
    endpoint.params ??
    Object.fromEntries(
      [...endpoint.path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => [name, z.string().min(1)]),
    );
  const request = {
    ...(Object.keys(params).length ? { params: z.object(params) } : {}),
    ...(endpoint.query ? { query: z.object(endpoint.query) } : {}),
    ...(endpoint.body
      ? {
          body: {
            required: !endpoint.bodyOptional,
            content: {
              [endpoint.bodyContentType ?? "application/json"]: {
                schema: endpoint.body,
              },
            },
          },
        }
      : {}),
  };
  const operationId = `${endpoint.method}_${endpoint.path
    .replace(/^\/|\/$/g, "")
    .replace(/[{}]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")}`;

  return createRoute({
    method: endpoint.method,
    path: endpoint.path,
    tags: [endpoint.tag],
    operationId,
    summary: endpoint.summary,
    description: endpoint.description,
    ...(endpoint.authenticated || endpoint.adminOnly
      ? { security: [{ SessionCookie: [] }, { BearerToken: [] }] }
      : {}),
    ...(Object.keys(request).length ? { request } : {}),
    responses: {
      ...successResponse,
      ...errors,
    },
  });
}

const stringValue = z.string();
const optionalStringValue = z.string().optional();
const positiveIntegerQuery = z.coerce.number().int().min(1).optional();
const paginationQuery = {
  page: positiveIntegerQuery,
  limit: positiveIntegerQuery,
};
const endpoints: EndpointDefinition[] = [
  {
    method: "get",
    path: "/sitemap-comics.xml",
    tag: "Sitemaps",
    summary: "Get the comics XML sitemap",
    description: "Returns the XML sitemap for indexed comic pages.",
    xmlResponse: true,
  },
  {
    method: "get",
    path: "/sitemap-chapters.xml",
    tag: "Sitemaps",
    summary: "Get the chapters XML sitemap",
    description: "Returns the XML sitemap for indexed chapter pages.",
    xmlResponse: true,
  },
  {
    method: "get",
    path: "/v1/auth/get-session",
    tag: "Authentication",
    summary: "Get the current authentication session",
    description:
      "Returns the current Better Auth session, or an empty result when no session exists.",
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/auth/sign-in/email",
    tag: "Authentication",
    summary: "Sign in with email and password",
    description: "Authenticates a user and sets the session cookie.",
    body: z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
        callbackURL: optionalStringValue,
      })
      .passthrough(),
    errorStatuses: [400, 401, 500],
  },
  {
    method: "post",
    path: "/v1/auth/sign-up/email",
    tag: "Authentication",
    summary: "Create an account with email and password",
    description: "Creates an account and may send an email verification message.",
    body: z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(1),
        callbackURL: optionalStringValue,
      })
      .passthrough(),
    errorStatuses: [400, 409, 500],
  },
  {
    method: "post",
    path: "/v1/auth/sign-in/social",
    tag: "Authentication",
    summary: "Start social sign-in",
    description: "Starts an OAuth sign-in flow. Google is configured as the social provider.",
    body: z
      .object({
        provider: z.string(),
        callbackURL: optionalStringValue,
        errorCallbackURL: optionalStringValue,
        newUserCallbackURL: optionalStringValue,
      })
      .passthrough(),
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/auth/sign-out",
    tag: "Authentication",
    summary: "Sign out",
    description: "Ends the current session and clears its cached session entry.",
    authenticated: true,
    errorStatuses: [401, 500],
  },
  {
    method: "get",
    path: "/v1/auth/callback/{providerId}",
    tag: "Authentication",
    summary: "Complete social sign-in",
    description: "Handles the provider callback in the Better Auth OAuth flow.",
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/auth/forget-password",
    tag: "Authentication",
    summary: "Request a password reset",
    description: "Sends a password reset link to the account email address.",
    body: z.object({ email: z.string().email(), redirectTo: optionalStringValue }).passthrough(),
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/auth/reset-password",
    tag: "Authentication",
    summary: "Reset a password",
    description: "Sets a new password using a valid password-reset token.",
    body: z.object({ newPassword: z.string().min(1), token: z.string().min(1) }).passthrough(),
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/auth/send-verification-email",
    tag: "Authentication",
    summary: "Send an email verification link",
    description: "Sends a verification email to the specified account.",
    body: z.object({ email: z.string().email(), callbackURL: optionalStringValue }).passthrough(),
    errorStatuses: [400, 500],
  },
  {
    method: "get",
    path: "/v1/auth/verify-email",
    tag: "Authentication",
    summary: "Verify an email address",
    description: "Verifies an email address using a Better Auth verification token.",
    query: { token: stringValue },
    errorStatuses: [400, 500],
  },
  {
    method: "get",
    path: "/v1/comics/trending",
    tag: "Comics",
    summary: "List trending comics",
    description: "Returns daily, weekly, or popular comics.",
    query: {
      period: z.enum(["daily", "weekly", "popular"]).optional(),
      limit: positiveIntegerQuery,
    },
  },
  {
    method: "get",
    path: "/v1/comics/browse",
    tag: "Comics",
    summary: "Browse comics",
    description: "Searches and filters the comic catalog with pagination.",
    query: {
      search: optionalStringValue,
      q: optionalStringValue,
      genre: optionalStringValue,
      status: optionalStringValue,
      type: optionalStringValue,
      sort: optionalStringValue,
      ...paginationQuery,
    },
  },
  {
    method: "get",
    path: "/v1/comics/{slug}",
    tag: "Comics",
    summary: "Get a comic by slug",
    description: "Returns public comic details for the specified comic slug.",
  },
  {
    method: "get",
    path: "/v1/comics/{slug}/chapters/{chapterSlug}",
    tag: "Chapters",
    summary: "Get a public chapter",
    description: "Returns chapter details and reader page data for a comic.",
  },
  {
    method: "get",
    path: "/v1/genres",
    tag: "Genres",
    summary: "List genres",
    description: "Returns the public genre catalog.",
  },
  {
    method: "get",
    path: "/v1/search/suggestions",
    tag: "Search",
    summary: "Get comic search suggestions",
    description:
      "Returns up to six title suggestions. Queries shorter than two characters return an empty list.",
    query: { q: stringValue, limit: positiveIntegerQuery },
    errorStatuses: [400, 500],
  },
  {
    method: "get",
    path: "/v1/sitemaps/comics",
    tag: "Sitemaps",
    summary: "List comics for sitemap generation",
    description: "Returns comic slugs and update times for sitemap generation.",
    query: { limit: positiveIntegerQuery },
  },
  {
    method: "get",
    path: "/v1/sitemaps/chapters",
    tag: "Sitemaps",
    summary: "List chapters for sitemap generation",
    description: "Returns paginated comic chapter slugs and update times.",
    query: paginationQuery,
  },
  {
    method: "get",
    path: "/v1/sitemaps/summary",
    tag: "Sitemaps",
    summary: "Get sitemap update summary",
    description: "Returns the most recent comic and chapter update times.",
  },
  {
    method: "get",
    path: "/v1/user/profile",
    tag: "Users",
    summary: "Get the current user profile",
    description: "Returns profile details for the authenticated user.",
    authenticated: true,
    errorStatuses: [401, 404, 500],
  },
  {
    method: "post",
    path: "/v1/user/avatar",
    tag: "Users",
    summary: "Upload a profile avatar",
    description: "Uploads an avatar image for the authenticated user.",
    body: z.object({ file: uploadedFileSchema }),
    bodyContentType: "multipart/form-data",
    authenticated: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "delete",
    path: "/v1/user/profile",
    tag: "Users",
    summary: "Delete the current user account",
    description:
      "Permanently deletes the authenticated user's account. Password or email confirmation may be required.",
    body: z.object({ password: optionalStringValue, email: optionalStringValue }),
    bodyOptional: true,
    authenticated: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "get",
    path: "/v1/bookmarks",
    tag: "Bookmarks",
    summary: "List the current user's bookmarks",
    description: "Returns the authenticated user's bookmarked comics.",
    authenticated: true,
    errorStatuses: [401, 500],
  },
  {
    method: "post",
    path: "/v1/bookmarks",
    tag: "Bookmarks",
    summary: "Create or update a bookmark",
    description: "Creates or updates the authenticated user's bookmark status for a comic.",
    body: z.object({ comicId: z.string().min(1), status: optionalStringValue }).passthrough(),
    authenticated: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "delete",
    path: "/v1/bookmarks/{comicId}",
    tag: "Bookmarks",
    summary: "Remove a bookmark",
    description: "Removes a comic from the authenticated user's bookmarks.",
    authenticated: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "get",
    path: "/v1/history",
    tag: "Reading History",
    summary: "List reading history",
    description: "Returns the authenticated user's reading history.",
    authenticated: true,
    errorStatuses: [401, 500],
  },
  {
    method: "post",
    path: "/v1/history",
    tag: "Reading History",
    summary: "Record reading progress",
    description: "Creates or updates a user's reading progress for a chapter.",
    body: z
      .object({
        comicId: z.string().min(1),
        chapterId: z.string().min(1),
        lastReadPage: positiveIntegerQuery,
        snapshotTotalPages: positiveIntegerQuery,
      })
      .passthrough(),
    authenticated: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "get",
    path: "/v1/comments",
    tag: "Comments",
    summary: "List comments",
    description: "Returns comments for a comic or chapter.",
    query: { comicId: optionalStringValue, chapterId: optionalStringValue },
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/comments",
    tag: "Comments",
    summary: "Post a comment",
    description: "Posts a comment as an authenticated user or as a guest with guest details.",
    body: z
      .object({
        comicId: optionalStringValue,
        chapterId: optionalStringValue,
        content: z.string().optional(),
        guestName: optionalStringValue,
        guestEmail: z.string().email().optional(),
      })
      .passthrough(),
    successStatus: 201,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "post",
    path: "/v1/comments/{commentId}/like",
    tag: "Comments",
    summary: "Toggle a comment like",
    description: "Adds or removes the authenticated user's like on a comment.",
    authenticated: true,
    errorStatuses: [400, 401, 404, 500],
  },
  {
    method: "delete",
    path: "/v1/comments/{commentId}",
    tag: "Comments",
    summary: "Delete a comment",
    description: "Deletes a comment owned by the current user or by an administrator.",
    authenticated: true,
    errorStatuses: [400, 401, 403, 404, 500],
  },
  {
    method: "post",
    path: "/v1/comments/{commentId}/report",
    tag: "Comments",
    summary: "Report a comment",
    description: "Submits a moderation report for a comment. Guest reporter details are supported.",
    body: z
      .object({
        reason: z.string().min(1),
        details: optionalStringValue,
        guestName: optionalStringValue,
        guestEmail: z.string().email().optional(),
      })
      .passthrough(),
    successStatus: 201,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "post",
    path: "/v1/ratings",
    tag: "Ratings",
    summary: "Submit a comic rating",
    description: "Creates or updates the authenticated user's comic rating.",
    body: z.object({ comicId: z.string().min(1), score: z.number() }).passthrough(),
    authenticated: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "post",
    path: "/v1/view",
    tag: "Views",
    summary: "Record a comic or chapter view",
    description: "Records a view unless the request user agent is identified as a bot.",
    body: z.object({ comicId: optionalStringValue, chapterId: optionalStringValue }).passthrough(),
    errorStatuses: [400, 500],
  },
  {
    method: "post",
    path: "/v1/realtime/auth",
    tag: "Realtime",
    summary: "Authorize a realtime channel",
    description: "Authorizes a Pusher channel subscription using the current user context.",
    body: z.object({ socket_id: z.string().min(1), channel_name: z.string().min(1) }).passthrough(),
    bodyContentType: "application/x-www-form-urlencoded",
    errorStatuses: [400, 401, 500],
  },
  {
    method: "get",
    path: "/v1/realtime/ws",
    tag: "Realtime",
    summary: "Open a realtime WebSocket connection",
    description:
      "Upgrades the request to a WebSocket connection for global presence or a comment stream.",
    query: { channel: optionalStringValue },
    successStatus: 101,
    webSocket: true,
    errorStatuses: [400, 401, 500],
  },
  {
    method: "get",
    path: "/v1/admin/users",
    tag: "Administration",
    summary: "List users",
    description: "Returns a searchable, paginated user list. Requires an administrator account.",
    query: { q: optionalStringValue, ...paginationQuery },
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/users",
    tag: "Administration",
    summary: "Create a user",
    description: "Creates a user account. Requires an administrator account.",
    body: z
      .object({ name: stringValue, email: z.string().email(), password: stringValue })
      .passthrough(),
    successStatus: 201,
    adminOnly: true,
    errorStatuses: [400, 401, 403, 409, 500],
  },
  {
    method: "put",
    path: "/v1/admin/users/{id}",
    tag: "Administration",
    summary: "Update a user",
    description: "Updates user details. Requires an administrator account.",
    body: jsonObjectSchema,
    adminOnly: true,
  },
  {
    method: "delete",
    path: "/v1/admin/users/{id}",
    tag: "Administration",
    summary: "Delete a user",
    description: "Permanently deletes a user account. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/stats",
    tag: "Administration",
    summary: "Get platform statistics",
    description: "Returns administrative platform statistics.",
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/reports",
    tag: "Moderation",
    summary: "List moderation reports",
    description: "Returns paginated moderation reports, optionally filtered by status.",
    query: { ...paginationQuery, status: optionalStringValue },
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/reports/{id}/action",
    tag: "Moderation",
    summary: "Resolve a moderation report",
    description:
      "Performs the requested moderation action on a report. Requires an administrator account.",
    body: z.object({ action: stringValue }).passthrough(),
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/genres",
    tag: "Administration",
    summary: "List all genres",
    description: "Returns the complete genre catalog. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/genres",
    tag: "Administration",
    summary: "Create a genre",
    description: "Creates a genre. Requires an administrator account.",
    body: z.object({ name: stringValue, slug: optionalStringValue }).passthrough(),
    successStatus: 201,
    adminOnly: true,
  },
  {
    method: "put",
    path: "/v1/admin/genres/{id}",
    tag: "Administration",
    summary: "Update a genre",
    description: "Updates a genre. Requires an administrator account.",
    body: z.object({ name: optionalStringValue, slug: optionalStringValue }).passthrough(),
    adminOnly: true,
  },
  {
    method: "delete",
    path: "/v1/admin/genres/{id}",
    tag: "Administration",
    summary: "Delete a genre",
    description: "Deletes a genre. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/comics",
    tag: "Administration",
    summary: "List comics for administration",
    description:
      "Returns a searchable, paginated comic catalog. Requires an administrator account.",
    query: { q: optionalStringValue, status: optionalStringValue, ...paginationQuery },
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/comics",
    tag: "Administration",
    summary: "Create a comic",
    description:
      "Creates a comic and optionally uploads cover and banner images. Requires an administrator account.",
    body: z
      .object({
        title: stringValue,
        synopsis: optionalStringValue,
        type: optionalStringValue,
        status: optionalStringValue,
        accessTier: optionalStringValue,
        alternateTitles: z.array(z.string()).optional(),
        genreIds: optionalStringValue,
        creator: optionalStringValue,
        cover: uploadedFileSchema.optional(),
        coverUrlSource: optionalStringValue,
        banner: uploadedFileSchema.optional(),
        bannerUrlSource: optionalStringValue,
      })
      .passthrough(),
    bodyContentType: "multipart/form-data",
    successStatus: 201,
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/comics/{id}",
    tag: "Administration",
    summary: "Get a comic for administration",
    description: "Returns comic details by identifier. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "put",
    path: "/v1/admin/comics/{id}",
    tag: "Administration",
    summary: "Update a comic",
    description:
      "Updates comic details and optionally uploads cover or banner images. Requires an administrator account.",
    body: z
      .object({
        title: optionalStringValue,
        synopsis: optionalStringValue,
        type: optionalStringValue,
        status: optionalStringValue,
        accessTier: optionalStringValue,
        alternateTitles: z.array(z.string()).optional(),
        genreIds: optionalStringValue,
        creator: optionalStringValue,
        cover: uploadedFileSchema.optional(),
        coverUrlSource: optionalStringValue,
        banner: uploadedFileSchema.optional(),
        bannerUrlSource: optionalStringValue,
      })
      .passthrough(),
    bodyContentType: "multipart/form-data",
    adminOnly: true,
  },
  {
    method: "delete",
    path: "/v1/admin/comics/{id}",
    tag: "Administration",
    summary: "Delete a comic",
    description: "Deletes a comic and its associated data. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/comics/{comicId}/chapters",
    tag: "Administration",
    summary: "List comic chapters",
    description: "Returns chapters belonging to a comic. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/comics/{comicId}/chapters/init",
    tag: "Administration",
    summary: "Initialize a chapter upload",
    description: "Creates chapter metadata before page uploads. Requires an administrator account.",
    body: z
      .object({
        chapterNumber: stringValue,
        title: optionalStringValue,
        accessTier: optionalStringValue,
        isEarlyAccess: z.boolean().optional(),
        totalPages: z.number().int().min(0),
      })
      .passthrough(),
    successStatus: 201,
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/comics/{comicId}/chapters/{id}/pages/upload",
    tag: "Administration",
    summary: "Upload a chapter page",
    description: "Uploads one page image for a chapter. Requires an administrator account.",
    body: z
      .object({
        pageNumber: z.coerce.number().int().min(1),
        file: uploadedFileSchema,
        width: z.coerce.number().int().optional(),
        height: z.coerce.number().int().optional(),
      })
      .passthrough(),
    bodyContentType: "multipart/form-data",
    successStatus: 201,
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/comics/{comicId}/chapters/{id}/finalize",
    tag: "Administration",
    summary: "Finalize a chapter upload",
    description:
      "Sets the final page count for an uploaded chapter. Requires an administrator account.",
    body: z.object({ totalPages: z.number().int().min(0) }).passthrough(),
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/comics/{comicId}/chapters",
    tag: "Administration",
    summary: "Create a chapter with page images",
    description:
      "Creates a chapter and uploads its page images in one request. Requires an administrator account.",
    body: z
      .object({
        chapterNumber: optionalStringValue,
        title: optionalStringValue,
        accessTier: optionalStringValue,
        isEarlyAccess: optionalStringValue,
        pages: z.array(uploadedFileSchema),
      })
      .passthrough(),
    bodyContentType: "multipart/form-data",
    successStatus: 201,
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/comics/{comicId}/chapters/{id}",
    tag: "Administration",
    summary: "Get a chapter for administration",
    description: "Returns chapter details and pages. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "put",
    path: "/v1/admin/comics/{comicId}/chapters/{id}",
    tag: "Administration",
    summary: "Update chapter metadata",
    description: "Updates chapter metadata. Requires an administrator account.",
    body: z
      .object({
        chapterNumber: optionalStringValue,
        title: optionalStringValue,
        accessTier: optionalStringValue,
        isEarlyAccess: z.boolean().optional(),
      })
      .passthrough(),
    adminOnly: true,
  },
  {
    method: "delete",
    path: "/v1/admin/comics/{comicId}/chapters/{id}",
    tag: "Administration",
    summary: "Delete a chapter",
    description: "Deletes a chapter and its stored pages. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/storage/purge-orphans",
    tag: "Administration",
    summary: "Purge orphaned storage files",
    description:
      "Deletes media files not associated with database records. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "get",
    path: "/v1/admin/system/maintenance-status",
    tag: "Administration",
    summary: "Get maintenance status",
    description:
      "Returns cache, analytics, storage, and synchronization health metrics. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/system/sync-views",
    tag: "Administration",
    summary: "Synchronize view counts",
    description:
      "Synchronizes view deltas and refreshes comic rankings. Requires an administrator account.",
    adminOnly: true,
  },
  {
    method: "post",
    path: "/v1/admin/system/clear-search-cache",
    tag: "Administration",
    summary: "Clear search suggestion cache",
    description: "Deletes cached comic search suggestions. Requires an administrator account.",
    adminOnly: true,
  },
];

function registerApiContracts(app: OpenAPIHono<AppEnv>) {
  app.openAPIRegistry.register("JsonObject", jsonObjectSchema);
  app.openAPIRegistry.register("ErrorResponse", errorResponseSchema);
  app.openAPIRegistry.register("Pagination", paginationSchema);
  app.openAPIRegistry.registerComponent("securitySchemes", "SessionCookie", {
    type: "apiKey",
    in: "cookie",
    name: "komikhq.session_token",
    description: "Session cookie. The API also accepts the Better Auth session cookie.",
  });
  app.openAPIRegistry.registerComponent("securitySchemes", "BearerToken", {
    type: "http",
    scheme: "bearer",
    description: "Bearer session token supplied in the Authorization header.",
  });

  for (const endpoint of endpoints) {
    app.openAPIRegistry.registerPath(defineEndpoint(endpoint));
  }
}

export function registerApiDocs(app: OpenAPIHono<AppEnv>) {
  registerApiContracts(app);
  app.get("/", swaggerUI({ url: "/openapi.json" }));
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "KomikHQ API",
      version: "1.0.0",
      description:
        "The KomikHQ platform API. This document describes mounted HTTP endpoints, configured core authentication operations, request parameters, access requirements, and response conventions.",
    },
    tags: [
      {
        name: "Authentication",
        description: "Account registration, sign-in, and session management.",
      },
      { name: "Administration", description: "Administrator-only platform management operations." },
      { name: "Bookmarks", description: "User comic bookmarks." },
      { name: "Chapters", description: "Public comic chapter and reader data." },
      { name: "Comments", description: "Comic and chapter comments and moderation." },
      { name: "Comics", description: "Comic discovery and catalog endpoints." },
      { name: "Genres", description: "Comic genre catalog." },
      { name: "Health", description: "Service health status." },
      { name: "Moderation", description: "Administrator moderation tools." },
      { name: "Reading History", description: "User reading progress and history." },
      {
        name: "Realtime",
        description: "Realtime channel authorization and WebSocket connections.",
      },
      { name: "Ratings", description: "Comic ratings." },
      { name: "Search", description: "Comic search and suggestions." },
      { name: "Sitemaps", description: "XML sitemaps and sitemap data feeds." },
      { name: "Users", description: "User profile and account operations." },
      { name: "Views", description: "Comic and chapter view tracking." },
    ],
  });
}
