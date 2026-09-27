import { expect, test } from '../../fixtures/pom/test-options.js';
import { AppConfig } from '../../config/app.config.js';
import { Tag } from '../../enums/tags.enum.js';

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] }, authSessionMode: 'skip' });

  test(
    'TC01 should sign the user in from the login page when valid credentials are provided',
    { tag: [Tag.Smoke, Tag.Sanity, Tag.Auth] },
    async ({ loginPage }) => {
      await test.step('Given the unauthenticated user is on the login page', async () => {
        await loginPage.navigate();
      });

      await test.step('When the user submits valid credentials', async () => {
        await loginPage.login(AppConfig.credentials.email, AppConfig.credentials.password);
      });

      await test.step('Then the user should be redirected to the main application', async () => {
        const appHost = new URL(AppConfig.baseURL).hostname;
        await expect(loginPage.page).toHaveURL(
          (url: URL) => url.hostname === appHost && !url.pathname.includes('/realms/'),
          { timeout: AppConfig.timeouts.expect },
        );
      });
    },
  );
});
