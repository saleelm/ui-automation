import type { Page } from '@playwright/test';

export const ONBOARDING_STORAGE_KEYS = {
  tourCompleted: 'app_onboarding_completed',
  tourSkipped: 'app_tour_skipped',
  welcomeDismissed: 'welcome_modal_dismissed',
  onboardingAssistant: 'app_onboarding_assistant_skipped',
} as const;

/**
 * Injects scripts to ensure localStorage and sessionStorage skip onboarding in new navigations
 */
export async function addOnboardingSkipInitScript(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('app_onboarding_completed', 'true');
      window.localStorage.setItem('app_tour_skipped', 'true');
      window.localStorage.setItem('welcome_modal_dismissed', 'true');
      window.localStorage.setItem('app_onboarding_assistant_skipped', 'true');
      window.sessionStorage.setItem('app_onboarding_completed', 'true');
      window.sessionStorage.setItem('app_tour_skipped', 'true');
      window.sessionStorage.setItem('welcome_modal_dismissed', 'true');
      window.sessionStorage.setItem('app_onboarding_assistant_skipped', 'true');
    } catch {
      // In case storage is temporarily unavailable
    }
  });
}

/**
 * Directly seeds localStorage & sessionStorage skip flags in the current page
 */
export async function seedOnboardingSkipFlags(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      window.localStorage.setItem('app_onboarding_completed', 'true');
      window.localStorage.setItem('app_tour_skipped', 'true');
      window.localStorage.setItem('welcome_modal_dismissed', 'true');
      window.localStorage.setItem('app_onboarding_assistant_skipped', 'true');
      window.sessionStorage.setItem('app_onboarding_completed', 'true');
      window.sessionStorage.setItem('app_tour_skipped', 'true');
      window.sessionStorage.setItem('welcome_modal_dismissed', 'true');
      window.sessionStorage.setItem('app_onboarding_assistant_skipped', 'true');
    } catch {
      // ignore
    }
  });
}

/**
 * Checks if the onboarding welcome gate is present and bypasses it
 */
export async function bypassOnboardingGateIfPresent(page: Page): Promise<boolean> {
  const welcomeText = page.getByText(/welcome/i, { exact: false });
  const isGateVisible = await welcomeText.isVisible().catch(() => false);

  if (!isGateVisible) {
    return false;
  }

  // Attempt to click skip/dismiss/get started button
  const bypassButtons = [
    page.getByRole('button', { name: /skip|dismiss|close|get started|continue/i }),
    page.locator('button[data-testid="skip-onboarding"]'),
    page.locator('.onboarding-modal button.close'),
  ];

  for (const button of bypassButtons) {
    if (await button.isVisible().catch(() => false)) {
      await button.click().catch(() => {});
      break;
    }
  }

  // Also set storage flags to ensure gate stays closed
  await seedOnboardingSkipFlags(page);

  await welcomeText.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  return true;
}
