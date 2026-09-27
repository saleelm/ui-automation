import type { Page, Route } from '@playwright/test';
import type { z } from 'zod';
import type { RouteCleanup, RouteMatcher, InterceptValidateAndContinueOptions } from './types.js';
import { parseRoutePayload } from './route-payload.js';

/**
 * Intercepts matching requests, optionally validates the outgoing body with a Zod schema,
 * runs an optional callback with { method, payload, status, url }, and continues the request.
 * Supports optional method and urlExcludes filters.
 * Returns a RouteCleanup function to unroute the handler.
 */
export async function interceptValidateAndContinue<T extends z.ZodTypeAny>(
  page: Page,
  url: RouteMatcher,
  schema: T,
  options?: InterceptValidateAndContinueOptions<z.infer<T>>,
): Promise<RouteCleanup> {
  const handler = async (route: Route): Promise<void> => {
    const request = route.request();

    if (options?.method && request.method().toUpperCase() !== options.method.toUpperCase()) {
      await route.continue();
      return;
    }

    if (options?.urlExcludes) {
      const reqUrl = request.url();
      const isExcluded =
        typeof options.urlExcludes === 'string'
          ? reqUrl.includes(options.urlExcludes)
          : options.urlExcludes.test(reqUrl);

      if (isExcluded) {
        await route.continue();
        return;
      }
    }

    const rawPayload = parseRoutePayload(request);
    const parsed = schema.parse(rawPayload);

    if (options?.onIntercept) {
      await options.onIntercept({
        method: request.method(),
        payload: parsed,
        url: request.url(),
      });
    }

    await route.continue();
  };

  await page.route(url, handler);

  return async () => {
    await page.unroute(url, handler);
  };
}
