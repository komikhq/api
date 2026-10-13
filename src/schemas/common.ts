import { z, type RouteConfig } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "Request failed." }),
    details: z.unknown().optional(),
  })
  .openapi("ErrorResponse");

export const SuccessResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
  })
  .passthrough()
  .openapi("SuccessResponse");

export const PaginationSchema = z
  .object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })
  .openapi("Pagination");

export const JsonObjectSchema = z.object({}).passthrough().openapi("JsonObject");

export const StringIdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      param: { name: "id", in: "path", required: true },
      example: "c1a2b3",
    }),
});

export const AdminSecurity: NonNullable<RouteConfig["security"]> = [
  { SessionCookie: [] },
  { BearerToken: [] },
];
export const UserSecurity: NonNullable<RouteConfig["security"]> = [
  { SessionCookie: [] },
  { BearerToken: [] },
];

export const CommonErrorResponses = {
  400: {
    description: "The request contains invalid input.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  401: {
    description: "Authentication is required or the session is invalid.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  403: {
    description: "The authenticated user is not permitted to perform this operation.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  404: {
    description: "The requested resource was not found.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  409: {
    description: "The request conflicts with the current resource state.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
  500: {
    description: "An unexpected server error occurred.",
    content: { "application/json": { schema: ErrorResponseSchema } },
  },
} as const;
