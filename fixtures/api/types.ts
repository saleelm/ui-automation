import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';

export interface ApiRequestParams {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
  url: string;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiRequestResult<T> {
  response: APIResponse;
  data: T;
  status: number;
}

export type ApiRequestFunction = <T extends z.ZodTypeAny>(
  params: ApiRequestParams,
  schema: T,
  requestContext?: APIRequestContext,
) => Promise<ApiRequestResult<z.infer<T>>>;
