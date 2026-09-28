import { test } from '../fixtures/pom/test-options.js';
import { bootstrapAuthStorageState } from '../helpers/auth.helper.js';

test.describe('Authentication Setup', () => {
  test.use({ authSessionMode: 'skip' });

  test('bootstrap auth storage state', async ({ page, context, loginPage }) => {
    test.skip(
      !process.env['QA_USER_EMAIL'] || !process.env['KEYCLOAK_URL'],
      'Skipping auth setup: QA_USER_EMAIL and KEYCLOAK_URL are not configured in environment',
    );
    await bootstrapAuthStorageState({ page, context, loginPage });
  });
});
