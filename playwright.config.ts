import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const environment = process.env['ENVIRONMENT'] || 'qa';
dotenv.config({ path: path.resolve(process.cwd(), `env/.env.${environment}`) });

const storageStatePath = path.resolve(process.cwd(), 'playwright/.auth/userSession.json');
if (!fs.existsSync(storageStatePath)) {
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  fs.writeFileSync(storageStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
}

const isCi = Boolean(process.env['CI']);

const reporters: ReporterDescription[] = [
  ['line'],
  ['allure-playwright', { resultsDir: 'allure-results', detail: true }],
];

if (process.env['TESTRAIL_ENABLED'] === 'true') {
  reporters.push(['junit', { outputFile: 'junit-results/results.xml' }]);
}

export default defineConfig({
  testDir: './tests',
  timeout: 5 * 60 * 1000,
  fullyParallel: true,
  forbidOnly: isCi,
  retries: 0,
  workers: isCi ? Number(process.env['WORKERS'] ?? '1') : 1,
  reporter: reporters,
  use: {
    ...(process.env['BASE_URL'] ? { baseURL: process.env['BASE_URL'] } : {}),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/userSession.json',
      },
      dependencies: ['setup'],
    },
  ],
});
