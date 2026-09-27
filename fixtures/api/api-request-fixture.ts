import { test as baseTest } from '@playwright/test';
import type { z } from 'zod';
import type { ApiRequestFunction, ApiRequestParams, ApiRequestResult } from './types.js';
import { executeApiRequest } from './plain-function.js';

export interface ApiFixtures {
  apiRequest: ApiRequestFunction;
}

export const apiTest = baseTest.extend<ApiFixtures>({
  apiRequest: async ({ request }, use) => {
    const apiRequestFn: ApiRequestFunction = async <T extends z.ZodTypeAny>(
      params: ApiRequestParams,
      schema: T,
    ): Promise<ApiRequestResult<z.infer<T>>> => {
      return await executeApiRequest(request, params, schema);
    };

    await use(apiRequestFn);
  },
});
