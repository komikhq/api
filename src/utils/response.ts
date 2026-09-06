import type { Context } from "hono";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json(data, status);
}

export function paginatedResponse<T>(
  c: Context,
  dataKey: string,
  items: T[],
  pagination: PaginationMeta
) {
  return c.json({
    [dataKey]: items,
    pagination,
  });
}

export function errorResponse(
  c: Context,
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 500 = 500,
  details?: any
) {
  return c.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    status
  );
}
