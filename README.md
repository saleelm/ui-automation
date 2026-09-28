# UI Test Platform

A robust, enterprise-grade UI automation framework built with **Playwright** and **TypeScript** (ESM). Designed for scalable web applications requiring modern authentication, session persistence across `localStorage` and `sessionStorage`, deterministic waiting, API traffic interception, and Page Object Model (POM) fixture injection.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Install Playwright Browsers](#2-install-playwright-browsers)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
- [Running Tests](#running-tests)
  - [Authentication Bootstrap](#authentication-bootstrap)
  - [Execution Commands](#execution-commands)
  - [Tag-Based Filtering](#tag-based-filtering)
- [Framework Architecture & Patterns](#framework-architecture--patterns)
  - [Authentication & Storage State](#authentication--storage-state)
  - [Onboarding Gate Bypass](#onboarding-gate-bypass)
  - [Page Object Model (POM)](#page-object-model-pom)
  - [Fixture Architecture](#fixture-architecture)
  - [API Interception (`helpers/api/`)](#api-interception-helpersapi)
  - [Direct API Testing (`fixtures/api/`)](#direct-api-testing-fixturesapi)
- [Adding New Tests (Step-by-Step)](#adding-new-tests-step-by-step)
- [Code Quality & Linting](#code-quality--linting)
- [Reporting](#reporting)
- [CI/CD (GitHub Actions)](#cicd-github-actions)

---

## Features

- **Dual-Mode Auth**: Supports direct token-based password grant (`AUTH_MODE=token`) or browser-based two-step UI login (`AUTH_MODE=ui`).
- **Complete Session Persistence**: Preserves and synchronizes authenticated state across both `localStorage` and `sessionStorage`.
- **Zero Arbitrary Sleeps**: 100% deterministic waiting using web-first assertions, visible readiness anchors, and response matchers. No `page.waitForTimeout`.
- **Automated Gate Bypass**: Transparently bypasses onboarding/welcome overlays for test speed, with opt-out capability for gate-specific tests.
- **Fixture-Injected Page Objects**: Test specs never call `new PageObject(page)`; all page objects and session state hooks are managed through Playwright test fixtures.
- **Network Interception Helpers**: 5 standardized interception patterns to mock, validate with Zod, drop, or mutate browser HTTP traffic.
- **Strict TypeScript & ESLint**: TypeScript 5.9 with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and ESLint 9 flat config targeting type safety.
- **Allure & TestRail Integration**: Rich Allure HTML reporting out-of-the-box and optional JUnit export for TestRail.

---

## Tech Stack

| Technology                       | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| **Node.js (>=20)**               | Runtime environment (`type: module`)           |
| **Playwright (`^1.62.1`)**       | Modern web automation engine (Chromium)        |
| **TypeScript (`^5.9.0`)**        | Typed JavaScript with strict compiler settings |
| **Zod (`^4.0.0`)**               | Runtime API schema validation                  |
| **ESLint 9 + TypeScript-ESLint** | Static analysis and type-aware linting         |
| **Prettier**                     | Code formatting                                |
| **Allure Playwright**            | Visual test execution reports                  |
| **Dotenv**                       | Dynamic environment profile loading            |

---

## Project Structure

```text
ui-test-platform/
├── .cursor/
│   ├── rules/                 # Coding guidelines (alwaysApply)
│   └── skills/                # Step-by-step workflows (discovery, POM, triage)
├── .github/workflows/
│   ├── on-demand.yml          # On-demand test execution with matrix sharding & S3 publish
│   ├── sanity.yml             # Sanity test suite workflow
│   └── post-prod.yml          # Production verification workflow
├── config/
│   └── app.config.ts          # Central AppConfig object with typed getters and timeouts
├── constants/
│   ├── api/                   # API endpoint constants ({ method, path, pattern })
│   └── navigation/            # Navigation routes and URL constants
├── enums/
│   └── tags.enum.ts           # Tag enum (@smoke, @sanity, @regression, @auth)
├── env/
│   └── .env.local.example     # Committed template for local test runs
├── fixtures/
│   ├── api/                   # Direct API request fixtures and Zod parser
│   └── pom/                   # POM fixtures (loginPage, session sync, auto fixtures)
├── helpers/
│   ├── api/                   # 5 network interception helper utilities
│   ├── async.helper.ts        # Polling and retry utilities
│   ├── auth.helper.ts         # Token fetching, storage injection, auth bootstrap
│   ├── onboarding-tour-session.helper.ts # Onboarding bypass helpers
│   └── random-data.helper.ts  # Test data generators (random strings, UUIDs)
├── pages/
│   ├── base.page.ts           # Abstract BasePage with navigation & API waiting
│   └── login.page.ts          # Two-step login page object
├── playwright/
│   └── .auth/                 # Stored session states (.gitkeep committed)
├── schemas/
│   └── auth/                  # Zod request/response schemas
├── tests/
│   ├── auth.setup.ts          # Setup project test generating userSession.json
│   └── login/
│       └── login.spec.ts      # Sample login test spec
├── eslint.config.mjs          # Flat ESLint configuration
├── package.json               # Scripts and dependencies
├── playwright.config.ts       # Main Playwright configuration
└── tsconfig.json              # Strict TypeScript configuration
```

---

## Prerequisites

- **Node.js**: `v20.x` or higher (verified up to `v23.x`)
- **npm**: `v10.x` or higher

Check your versions:

```bash
node -v
npm -v
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

Download the Chromium browser binary:

```bash
npx playwright install chromium
```

### 3. Configure Environment Variables

The framework loads environment settings from `env/.env.<ENVIRONMENT>`. When `ENVIRONMENT` is omitted, it defaults to `qa`.

To set up a local testing profile:

```bash
cp env/.env.local.example env/.env.local
```

Edit `env/.env.local` with your target URLs and credentials:

```ini
ENVIRONMENT=local
BASE_URL=http://localhost:3000
API_URL=https://qa-api.example.com


# TestRail integration
TESTRAIL_ENABLED=false
```

> **Note**: Real `.env` files are ignored by git. Only `.env.local.example` is tracked.

---

## Running Tests

### Authentication Bootstrap

The test suite runs with a dependency on the `setup` project (`tests/auth.setup.ts`), which logs in and writes `playwright/.auth/userSession.json`.

To run setup manually:

```bash
# Using default environment (qa)
npm run test:setup

# Using local profile
npm run test:local:setup
```

### Execution Commands

| Command                   | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `npm test`                | Runs the full suite against the default environment (`qa`) |
| `npm run test:local`      | Runs tests using `env/.env.local`                          |
| `npm run test:list`       | Lists all discovered setup and test specs                  |
| `npm run test:local:list` | Lists all specs under the `local` environment              |
| `npm run test:headed`     | Runs tests with visible Chromium browser                   |
| `npm run test:ui`         | Launches interactive Playwright UI Mode                    |

### Tag-Based Filtering

Filter tests using `@` tags:

```bash
npm run test:smoke       # Tests tagged @smoke
npm run test:sanity      # Tests tagged @sanity
npm run test:regression  # Tests tagged @regression
npm run test:auth        # Tests tagged @auth
```

Or pass custom greps:

```bash
npx playwright test --grep "@smoke|@sanity"
```

---

## Framework Architecture & Patterns

### Authentication & Storage State

1. **`tests/auth.setup.ts`**:
   - Configures `test.use({ authSessionMode: 'skip' })`.
   - Calls `bootstrapAuthStorageState()`:
     - Waits for `GET /v2/tenant/features` to return `200`.
     - In `token` mode: executes an OAuth2 password grant, gets user info, and injects OIDC keys into `localStorage` and `sessionStorage`.
     - In `ui` mode: navigates to `/` and executes the two-step login on `LoginPage`.
     - Saves storage state to `playwright/.auth/userSession.json`.
2. **Fresh Tokens**: In `token` mode, the auto-fixture `_ensureAuthSession` re-injects a fresh token before each test.
3. **Unauthenticated Tests**:
   Override storage in unauthenticated test blocks:
   ```ts
   test.use({
     storageState: { cookies: [], origins: [] },
     authSessionMode: 'skip',
   });
   ```

### Onboarding Gate Bypass

- When the application displays an onboarding/welcome overlay ("Welcome..."), `BasePage.goto()` automatically detects it, clicks the dismiss button, seeds completion flags into storage, and returns to the intended URL.
- To test the gate itself, set `onboardingBypassMode: 'skip'` in the test:
  ```ts
  test.use({ onboardingBypassMode: 'skip' });
  ```

### Page Object Model (POM)

All application page objects inherit from `BasePage` ([pages/base.page.ts](file:///Users/mohammedsaleel/Documents/ui-automation/pages/base.page.ts)):

- **Never instantiate page objects in specs**: Always inject them via fixtures (`async ({ loginPage }) => { ... }`).
- **Readiness Navigation**: Implement `navigate()` to wait for 1–2 visible interactive anchors, not just `domcontentloaded`.
- **API Waits**: Delegate network waits to `this.waitForApiResponse({ method, urlIncludes, status })`.

### Fixture Architecture

All test files import `test` and `expect` exclusively from `fixtures/pom/test-options.js`:

```ts
import { expect, test } from '../../fixtures/pom/test-options.js';
```

_(Never import `test` from `@playwright/test` directly in specs)._

Three auto-fixtures execute automatically before each test in sequence:

1. `_ensureAuthSession`: Ensures fresh token in token auth mode.
2. `_syncSessionStorage`: Copies auth and onboarding keys from `localStorage` into `sessionStorage`.
3. `_seedOnboardingAssistantState`: Seeds onboarding skip flags unless opted out.

### API Interception (`helpers/api/`)

Control browser HTTP traffic with 5 pre-built helper functions:

```ts
import {
  interceptValidateAndDrop,
  interceptValidateAndContinue,
  interceptModifyResponse,
  interceptPassthroughMutate,
  interceptFulfillJson,
} from '../../helpers/api/...';
```

- **`interceptValidateAndDrop`**: Validates request body with a Zod schema and aborts the request (`route.abort('failed')`).
- **`interceptValidateAndContinue`**: Validates payload with Zod, invokes a callback with `{ method, payload, url }`, and continues.
- **`interceptModifyResponse`**: Fetches the real response, overrides specific JSON fields, and fulfills.
- **`interceptPassthroughMutate`**: Fetches the real response, runs a callback to mutate the body, and fulfills.
- **`interceptFulfillJson`**: Fulfills a route with static JSON immediately without contacting the backend.

Always unroute in a `finally` block:

```ts
const unroute = await interceptValidateAndContinue(page, /.*\/v2\/items/, Schema);
try {
  await itemsPage.submit();
} finally {
  await unroute();
}
```

### Direct API Testing (`fixtures/api/`)

Make direct API calls (outside the browser) and parse responses with Zod:

```ts
test('validate API endpoint', async ({ apiRequest }) => {
  const { data, status } = await apiRequest(
    { method: 'GET', url: '/v2/tenant/features' },
    TenantFeaturesSchema,
  );
  expect(status).toBe(200);
});
```

---

## Adding New Tests (Step-by-Step)

When implementing a new feature suite:

1. **Discover UI with Playwright CLI**:
   ```bash
   ENVIRONMENT=local npm run test:setup
   npx playwright codegen --load-storage=playwright/.auth/userSession.json http://localhost:3000
   ```
2. **Create the Page Object**:
   Create `pages/<feature>.page.ts` extending `BasePage`.
3. **Register in Fixtures**:
   In `fixtures/pom/page-object-fixture.ts`, add the page to `PageObjectFixtures` and instantiate it in `pomTest.extend()`.
4. **Create API Constants & Zod Schemas (if needed)**:
   Add constants in `constants/api/<feature>.api.constants.ts` and schemas in `schemas/<feature>/<endpoint>.schema.ts`.
5. **Write the Spec**:
   Create `tests/<feature>/<feature>.spec.ts`:
   ```ts
   import { expect, test } from '../../fixtures/pom/test-options.js';
   import { Tag } from '../../enums/tags.enum.js';

   test.describe('Feature Name', () => {
     test(
       'TC01 should perform action when condition is met',
       { tag: [Tag.Smoke, Tag.Sanity] },
       async ({ myFeaturePage }) => {
         await test.step('Given the user is on the feature page', async () => {
           await myFeaturePage.navigate();
         });

         await test.step('When the user submits valid input', async () => {
           await myFeaturePage.submit();
         });

         await test.step('Then the outcome should be visible', async () => {
           await expect(myFeaturePage.successBanner).toBeVisible();
         });
       },
     );
   });
   ```
6. **Verify Quality**:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

---

## Code Quality & Linting

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run typecheck`    | Validates TypeScript types with `tsc --noEmit` |
| `npm run lint`         | Runs ESLint across the codebase                |
| `npm run lint:fix`     | Automatically fixes ESLint issues              |
| `npm run format`       | Formats all code with Prettier                 |
| `npm run format:check` | Checks code formatting conformity              |

---

## Reporting

### Allure Reports

The framework records Allure results automatically in `allure-results/`.

```bash
# Serve Allure report live
npm run report

# Generate static HTML report in allure-report/
npm run report:allure

# Open generated static report
npm run report:allure:open

# Clean previous report artifacts
npm run clean:results
```

---

## CI/CD (GitHub Actions)

The repository includes three ready-to-run GitHub Actions workflows in `.github/workflows/`:

1. **`on-demand.yml`**:
   - Manually triggered with parameters (branch, environment, tags, workers, shards).
   - Generates an environment file from GitHub secrets (`ENV_QA`, `ENV_STAGING`, etc.).
   - Splits test execution across matrix containers (`mcr.microsoft.com/playwright:v1.62.1-noble`).
   - Merges shard results and publishes Allure reports to AWS S3.
2. **`sanity.yml`**: Runs the `@sanity` test suite against the target environment.
3. **`post-prod.yml`**: Runs non-destructive smoke/sanity checks against production endpoints.
