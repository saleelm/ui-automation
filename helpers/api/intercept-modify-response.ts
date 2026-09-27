import type { Page, Route } from '@playwright/test';
import type { RouteCleanup, RouteMatcher } from './types.js';

/**
 * Fetches the real response from the network, overrides selected top-level JSON fields,
 * and fulfills the route with the modified JSON body.
 * Returns a RouteCleanup function to unroute the handler.
 */
export async function interceptModifyResponse(
  page: Page,
  url: RouteMatcher,
  overrides: Record<string, unknown>,
): Promise<RouteCleanup> {
  const handler = async (route: Route): Promise<void> => {
    const response = await route.fetch();
    const json = (await response.json()) as Record<string, unknown>;
    const modified = { ...json, ...overrides };
    await route.fulfill({
      response,
      json: modified,
    });
  };

  await page.route(url, handler);

  return async () => {
    await page.unroute(url, handler);
  };
}
