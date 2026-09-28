import { test } from '../fixtures/pom/test-options.js';
import { bootstrapAuthStorageState } from '../helpers/auth.helper.js';
import { AppConfig } from '../config/app.config.js';

test.describe('Authentication Setup', () => {
  test.use({ authSessionMode: 'skip' });

  test('bootstrap auth storage state', async ({ page, context, loginPage }) => {
    test.skip(
      !AppConfig.authUrl || !AppConfig.credentials.email,
      'Skipping auth setup: auth URL and user credentials are not configured in environment',
    );
    await bootstrapAuthStorageState({ page, context, loginPage });
  });
});
