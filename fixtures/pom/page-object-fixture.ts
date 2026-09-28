import { test as baseTest } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { PracticePage } from '../../pages/practice.page.js';
import { ensureFreshAuthSession } from '../../helpers/auth.helper.js';
import { addOnboardingSkipInitScript } from '../../helpers/onboarding-tour-session.helper.js';

export type AuthSessionMode = 'default' | 'skip';
export type OnboardingBypassMode = 'default' | 'skip';

export interface PageObjectOptions {
  authSessionMode: AuthSessionMode;
  onboardingBypassMode: OnboardingBypassMode;
}

export interface PageObjectFixtures {
  loginPage: LoginPage;
  practicePage: PracticePage;
}

export interface PageObjectAutoFixtures {
  _ensureAuthSession: void;
  _syncSessionStorage: void;
  _seedOnboardingAssistantState: void;
}

export const pomTest = baseTest.extend<
  PageObjectFixtures & PageObjectOptions & PageObjectAutoFixtures
>({
  authSessionMode: ['default', { option: true }],
  onboardingBypassMode: ['default', { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  practicePage: async ({ page }, use) => {
    await use(new PracticePage(page));
  },

  // 1. _ensureAuthSession — calls ensureFreshAuthSession unless authSessionMode === 'skip'
  _ensureAuthSession: [
    async ({ page, authSessionMode }, use) => {
      if (authSessionMode !== 'skip') {
        await ensureFreshAuthSession(page);
      }
      await use();
    },
    { auto: true },
  ],

  // 2. _syncSessionStorage — addInitScript copies auth and onboarding keys from localStorage into sessionStorage
  _syncSessionStorage: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        try {
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (
              key &&
              (key.startsWith('oidc.user:') ||
                key === 'user_auth_token' ||
                key === 'user' ||
                key === 'oidc-config-variables' ||
                key === 'commonDataPlaneId' ||
                key.includes('onboarding') ||
                key.includes('tour') ||
                key.includes('welcome'))
            ) {
              const val = window.localStorage.getItem(key);
              if (val !== null) {
                window.sessionStorage.setItem(key, val);
              }
            }
          }
        } catch {
          // ignore
        }
      });
      await use();
    },
    { auto: true },
  ],

  // 3. _seedOnboardingAssistantState — unless onboardingBypassMode === 'skip'
  _seedOnboardingAssistantState: [
    async ({ page, onboardingBypassMode }, use) => {
      if (onboardingBypassMode !== 'skip') {
        await addOnboardingSkipInitScript(page);
      }
      await use();
    },
    { auto: true },
  ],
});
