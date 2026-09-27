import type { Page, Route } from '@playwright/test';
import type { RouteCleanup, RouteMatcher } from './types.js';

/**
 * Fulfills a matching route immediately with a JSON body without hitting the network.
 * Returns a RouteCleanup function to unroute the handler.
 */
export async function interceptFulfillJson(
  page: Page,
  url: RouteMatcher,
  json: unknown,
  status = 200,
  headers?: Record<string, string>,
): Promise<RouteCleanup> {
  const handler = async (route: Route): Promise<void> => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      json,
      ...(headers ? { headers } : {}),
    });
  };

  await page.route(url, handler);

  return async () => {
    await page.unroute(url, handler);
  };
}
