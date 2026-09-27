import { test } from '../fixtures/pom/test-options.js';
import { bootstrapAuthStorageState } from '../helpers/auth.helper.js';

test.describe('Authentication Setup', () => {
  test.use({ authSessionMode: 'skip' });

  test('bootstrap auth storage state', async ({ page, context, loginPage }) => {
    await bootstrapAuthStorageState({ page, context, loginPage });
  });
});
