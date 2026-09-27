import type { APIRequestContext } from '@playwright/test';
import type { z } from 'zod';
import type { ApiRequestParams, ApiRequestResult } from './types.js';
import { AppConfig } from '../../config/app.config.js';

/**
 * Plain function to execute direct API requests and parse the response with Zod.
 * Note: params.data is passed as request body.
 */
export async function executeApiRequest<T extends z.ZodTypeAny>(
  requestContext: APIRequestContext,
  params: ApiRequestParams,
  schema: T,
): Promise<ApiRequestResult<z.infer<T>>> {
  const targetUrl = params.url.startsWith('http')
    ? params.url
    : `${AppConfig.apiUrl || AppConfig.baseURL}${params.url.startsWith('/') ? '' : '/'}${params.url}`;

  const requestOptions: Parameters<APIRequestContext['fetch']>[1] = {
    method: params.method,
    ...(params.data !== undefined ? { data: params.data } : {}),
    ...(params.params ? { params: params.params } : {}),
    ...(params.headers ? { headers: params.headers } : {}),
    timeout: params.timeout ?? AppConfig.timeouts.apiRouteFetch,
  };

  const response = await requestContext.fetch(targetUrl, requestOptions);
  const json: unknown = await response.json();
  const data = schema.parse(json);

  return {
    response,
    data,
    status: response.status(),
  };
}
