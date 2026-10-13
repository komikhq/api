import type { Context, Env, Input } from "hono";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<
  T,
  E extends Env = Env,
  P extends string = string,
  I extends Input = Input,
  S extends 200 | 201 = 200 | 201,
>(c: Context<E, P, I>, data: T, status: S = 200 as S) {
  return c.json(data, status);
}

export function paginatedResponse<T>(
  c: Context,
  dataKey: string,
  items: T[],
  pagination: PaginationMeta,
) {
  return c.json({
    [dataKey]: items,
    pagination,
  });
}

export function errorResponse<
  E extends Env = Env,
  P extends string = string,
  I extends Input = Input,
  S extends 400 | 401 | 403 | 404 | 409 | 500 = 400 | 401 | 403 | 404 | 409 | 500,
>(c: Context<E, P, I>, message: string, status: S = 500 as S, details?: any) {
  return c.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    status,
  );
}
