import type { Locator, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';
import { AppConfig } from '../config/app.config.js';
import { bypassOnboardingGateIfPresent } from '../helpers/onboarding-tour-session.helper.js';

export interface WaitForApiResponseParams {
  method?: string;
  urlIncludes: string;
  queryParams?: Record<string, string>;
  status?: number;
  timeout?: number;
}

export abstract class BasePage {
  readonly page: Page;
  protected lastNavigatedPath = '';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a path, checks URL conformity, and bypasses onboarding gate if visible.
   */
  async goto(
    path: string,
    options?: {
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
      timeout?: number;
    },
  ): Promise<void> {
    this.lastNavigatedPath = path;
    const waitUntil = options?.waitUntil ?? 'domcontentloaded';
    const timeout = options?.timeout ?? AppConfig.timeouts.navigation;

    await this.page.goto(path, { waitUntil, timeout });

    // Loop until welcome gate is hidden
    let gateAttempts = 0;
    while (gateAttempts < 3) {
      const bypassed = await bypassOnboardingGateIfPresent(this.page);
      if (!bypassed) {
        break;
      }
      gateAttempts++;
    }

    // If gate was bypassed and we are not on the requested path, return to intended path
    if (path !== '/' && !this.page.url().includes(path)) {
      await this.page.goto(path, { waitUntil, timeout });
    }
  }

  async waitForURL(
    url: string | RegExp | ((url: URL) => boolean),
    options?: {
      timeout?: number;
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
    },
  ): Promise<void> {
    const timeout = options?.timeout ?? AppConfig.timeouts.navigation;
    const waitUntil = options?.waitUntil ?? 'domcontentloaded';
    await this.page.waitForURL(url, { timeout, waitUntil });
  }

  async expectTitle(titleOrRegExp: string | RegExp, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? AppConfig.timeouts.expect;
    await expect(this.page).toHaveTitle(titleOrRegExp, { timeout });
  }

  async expectURL(
    urlOrRegExp: string | RegExp | ((url: URL) => boolean),
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? AppConfig.timeouts.expect;
    await expect(this.page).toHaveURL(urlOrRegExp, { timeout });
  }

  async expectVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? AppConfig.timeouts.expect;
    await expect(locator).toBeVisible({ timeout });
  }

  async reload(options?: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
    timeout?: number;
  }): Promise<void> {
    const waitUntil = options?.waitUntil ?? 'domcontentloaded';
    const timeout = options?.timeout ?? AppConfig.timeouts.navigation;
    await this.page.reload({ waitUntil, timeout });
  }

  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded',
    options?: { timeout?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? AppConfig.timeouts.navigation;
    await this.page.waitForLoadState(state, { timeout });
  }

  /**
   * Waits for a matching API response based on method, path fragment, query parameters, and status.
   * Never matches full hardcoded URLs.
   */
  async waitForApiResponse(params: WaitForApiResponseParams): Promise<Response> {
    const timeout = params.timeout ?? AppConfig.timeouts.apiRouteFetch;
    const expectedStatus = params.status ?? 200;

    return await this.page.waitForResponse(
      (response) => {
        const req = response.request();
        if (params.method && req.method().toUpperCase() !== params.method.toUpperCase()) {
          return false;
        }

        const responseUrl = response.url();
        if (!responseUrl.includes(params.urlIncludes)) {
          return false;
        }

        if (params.queryParams) {
          try {
            const parsedUrl = new URL(responseUrl);
            for (const [key, val] of Object.entries(params.queryParams)) {
              if (parsedUrl.searchParams.get(key) !== val) {
                return false;
              }
            }
          } catch {
            return false;
          }
        }

        if (response.status() !== expectedStatus) {
          return false;
        }

        return true;
      },
      { timeout },
    );
  }
}
