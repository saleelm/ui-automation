import type { BrowserContext, Page, APIRequestContext } from '@playwright/test';
import { request } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { AppConfig } from '../config/app.config.js';
import type { LoginPage } from '../pages/login.page.js';
import { seedOnboardingSkipFlags } from './onboarding-tour-session.helper.js';

export interface KeycloakAuthInfo {
  authority: string;
  realm: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

export interface UserProfile {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  [key: string]: unknown;
}

let cachedToken: {
  tokenData: TokenResponse;
  userInfo: UserProfile;
  expiresAt: number;
} | null = null;

export function parseKeycloakUrl(keycloakUrl: string): KeycloakAuthInfo {
  const url = new URL(keycloakUrl);
  const match = url.pathname.match(/(.*\/realms\/[^/]+)/);
  const basePath = match ? match[1] : '';
  const authority = `${url.origin}${basePath}`;
  const realmMatch = url.pathname.match(/\/realms\/([^/]+)/);
  const realm = realmMatch?.[1] ?? 'app';
  return { authority, realm };
}

export async function fetchToken(apiRequestContext?: APIRequestContext): Promise<{
  tokenData: TokenResponse;
  userInfo: UserProfile;
}> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return {
      tokenData: cachedToken.tokenData,
      userInfo: cachedToken.userInfo,
    };
  }

  const reqContext = apiRequestContext ?? (await request.newContext());
  const bodyParams = new URLSearchParams({
    client_id: AppConfig.clientId,
    grant_type: AppConfig.grantType,
    username: AppConfig.credentials.email,
    password: AppConfig.credentials.password,
  });

  const response = await reqContext.post(AppConfig.keycloakUrl, {
    data: bodyParams.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to obtain Keycloak token: ${response.status()} ${response.statusText()} - ${await response.text()}`,
    );
  }

  const tokenData = (await response.json()) as TokenResponse;
  const { authority } = parseKeycloakUrl(AppConfig.keycloakUrl);

  let userInfo: UserProfile = {
    email: AppConfig.credentials.email,
    preferred_username: AppConfig.credentials.email,
  };

  try {
    const userInfoResponse = await reqContext.get(`${authority}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    if (userInfoResponse.ok()) {
      userInfo = (await userInfoResponse.json()) as UserProfile;
    }
  } catch {
    // If userinfo endpoint fails or is unavailable, keep minimal profile
  }

  const expiresInSec = tokenData.expires_in ?? 3600;
  cachedToken = {
    tokenData,
    userInfo,
    expiresAt: Date.now() + expiresInSec * 1000,
  };

  return { tokenData, userInfo };
}

export function buildAuthStorageState(
  tokenData: TokenResponse,
  userInfo: UserProfile,
): Record<string, string> {
  const { authority } = parseKeycloakUrl(AppConfig.keycloakUrl);
  const oidcUserKey = `oidc.user:${authority}:${AppConfig.clientId}`;
  const expiresInSec = tokenData.expires_in ?? 3600;

  const oidcUserData = JSON.stringify({
    id_token: tokenData.id_token ?? '',
    session_state: null,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? '',
    token_type: tokenData.token_type ?? 'Bearer',
    scope: tokenData.scope ?? 'openid profile email',
    profile: userInfo,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSec,
  });

  const items: Record<string, string> = {
    [oidcUserKey]: oidcUserData,
    user_auth_token: tokenData.access_token,
    user: JSON.stringify(userInfo),
    'oidc-config-variables': JSON.stringify({
      authority,
      client_id: AppConfig.clientId,
    }),
  };

  if (AppConfig.dataplaneId) {
    items['commonDataPlaneId'] = AppConfig.dataplaneId;
  }

  return items;
}

export async function injectTokenAuth(
  page: Page,
  storageItems?: Record<string, string>,
): Promise<void> {
  let items = storageItems;
  if (!items) {
    const { tokenData, userInfo } = await fetchToken(page.request);
    items = buildAuthStorageState(tokenData, userInfo);
  }

  const finalItems = items;
  await page.addInitScript((injectedItems) => {
    for (const [key, value] of Object.entries(injectedItems)) {
      try {
        window.localStorage.setItem(key, value);
        window.sessionStorage.setItem(key, value);
      } catch {
        // storage may not be accessible in initial sandbox
      }
    }
  }, finalItems);

  if (page.url() !== 'about:blank') {
    await page.evaluate((injectedItems) => {
      for (const [key, value] of Object.entries(injectedItems)) {
        try {
          window.localStorage.setItem(key, value);
          window.sessionStorage.setItem(key, value);
        } catch {
          // ignore
        }
      }
    }, finalItems);
  }
}

export async function ensureFreshAuthSession(page: Page): Promise<void> {
  if (AppConfig.authMode === 'token') {
    await injectTokenAuth(page);
  }
}

export interface BootstrapAuthParams {
  page: Page;
  context: BrowserContext;
  loginPage: LoginPage;
  storageStatePath?: string;
}

export async function bootstrapAuthStorageState({
  page,
  context,
  loginPage,
  storageStatePath = 'playwright/.auth/userSession.json',
}: BootstrapAuthParams): Promise<void> {
  // 1. Start waiting for GET whose URL includes /v2/tenant/features
  const tenantFeaturesPromise = page.waitForResponse(
    (response) =>
      response.url().includes(AppConfig.tenantFeaturesPath) &&
      response.request().method() === 'GET',
    { timeout: AppConfig.timeouts.apiRouteFetch },
  );

  // 2. If AUTH_MODE=token: password-grant against KEYCLOAK_URL, fetch userinfo, inject OIDC/localStorage keys, then goto('/')
  if (AppConfig.authMode === 'token') {
    const { tokenData, userInfo } = await fetchToken(page.request);
    const storageItems = buildAuthStorageState(tokenData, userInfo);
    await injectTokenAuth(page, storageItems);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  } else {
    // 3. If AUTH_MODE=ui: goto('/'), then loginPage.login(email, password)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await loginPage.login(AppConfig.credentials.email, AppConfig.credentials.password);
  }

  // 4. Fail if tenant features status is not 200
  const tenantFeaturesResponse = await tenantFeaturesPromise;
  if (tenantFeaturesResponse.status() !== 200) {
    throw new Error(
      `Tenant features endpoint returned status ${tenantFeaturesResponse.status()}, expected 200`,
    );
  }

  // 5. Wait until URL host is BASE_URL host and path does not include /realms/
  const appHost = new URL(AppConfig.baseURL).hostname;
  await page.waitForURL(
    (url: URL) => url.hostname === appHost && !url.pathname.includes('/realms/'),
    { timeout: AppConfig.timeouts.navigateExpect },
  );

  // 6. Apply onboarding-assistant skip storage
  await seedOnboardingSkipFlags(page);

  // 7. Save context.storageState to playwright/.auth/userSession.json
  const absolutePath = path.resolve(process.cwd(), storageStatePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  await context.storageState({ path: absolutePath });
}
