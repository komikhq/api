import type { Context, Env, Input, TypedResponse } from "hono";

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
>(
  c: Context<E, P, I>,
  data: T,
): Response & TypedResponse<any, 200, "json">;
export function successResponse<
  T,
  S extends 200 | 201,
  E extends Env = Env,
  P extends string = string,
  I extends Input = Input,
>(
  c: Context<E, P, I>,
  data: T,
  status: S,
): Response & TypedResponse<any, S, "json">;
export function successResponse(
  c: Context,
  data: any,
  status: 200 | 201 = 200,
): any {
  return c.json(data, status);
}

export function paginatedResponse(
  c: Context,
  dataKey: string,
  items: any[],
  pagination: PaginationMeta,
): Response & TypedResponse<any, 200, "json"> {
  return c.json(
    {
      [dataKey]: items,
      pagination,
    },
    200,
  );
}

export function errorResponse<
  E extends Env = Env,
  P extends string = string,
  I extends Input = Input,
>(
  c: Context<E, P, I>,
  message: string,
): Response & TypedResponse<any, 500, "json">;
export function errorResponse<
  S extends 400 | 401 | 403 | 404 | 409 | 500,
  E extends Env = Env,
  P extends string = string,
  I extends Input = Input,
>(
  c: Context<E, P, I>,
  message: string,
  status: S,
  details?: any,
): Response & TypedResponse<any, S, "json">;
export function errorResponse(
  c: Context,
  message: string,
  status: any = 500,
  details?: any,
): any {
  return c.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    status,
  );
}
