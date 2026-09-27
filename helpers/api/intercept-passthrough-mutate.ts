import type { Page, Route } from '@playwright/test';
import type { RouteCleanup, RouteMatcher } from './types.js';

/**
 * Fetches the real response from the network, runs a mutator function on the JSON body,
 * and fulfills the route with the mutated body.
 * Returns a RouteCleanup function to unroute the handler.
 */
export async function interceptPassthroughMutate<T = unknown>(
  page: Page,
  url: RouteMatcher,
  mutator: (body: T) => T | Promise<T>,
): Promise<RouteCleanup> {
  const handler = async (route: Route): Promise<void> => {
    const response = await route.fetch();
    const json = (await response.json()) as T;
    const modified = await mutator(json);
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
