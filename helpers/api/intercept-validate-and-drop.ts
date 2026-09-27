import type { Page, Route } from '@playwright/test';
import type { z } from 'zod';
import type { RouteCleanup, RouteMatcher } from './types.js';
import { parseRoutePayload } from './route-payload.js';

/**
 * Intercepts matching requests, parses the outgoing body with a Zod schema,
 * runs an optional callback, and aborts the request with 'failed'.
 * Returns a RouteCleanup function to unroute the handler.
 */
export async function interceptValidateAndDrop<T extends z.ZodTypeAny>(
  page: Page,
  url: RouteMatcher,
  schema: T,
  onIntercept?: (parsedPayload: z.infer<T>) => void | Promise<void>,
): Promise<RouteCleanup> {
  const handler = async (route: Route): Promise<void> => {
    const rawPayload = parseRoutePayload(route.request());
    const parsed = schema.parse(rawPayload);
    if (onIntercept) {
      await onIntercept(parsed);
    }
    await route.abort('failed');
  };

  await page.route(url, handler);

  return async () => {
    await page.unroute(url, handler);
  };
}
