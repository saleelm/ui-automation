---
name: fixture-registration
description: Guide for registering new page objects and custom fixtures in page-object-fixture.ts
---

# Fixture Registration Skill

When a new page object is created under `pages/ter it in the POM fixture so specs can inject it without `new`.

### 1. Update `fixtures/pom/page-object-fixture.ts`

Import the new page object using the `.js` extension, then update both the interface and the extend call:

```ts
import { PipelinesPage } from '../../pages/s.page.js';

// 1. Add to PageObjectFixtures interface
export interface PageObjectFixtures {
  loginPage: LoginPage;
  pipelinesPage: PipelinesPage;
}

// 2. Add implementation to pomTest extend
export const pomTest = baseTest.extend<
  PageObjectFixtures & PageObjectOptions & PageObjectAutoFixtures
>({
  // ... existing options and auto-fixtures ...

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  pipelinesPage: async ({ page }, use) => {
    await use(new PipelinesPage(page));
  },
});
```

### 2. Preserve Auto Fixtures

Ensure the three auto fixtures remain untouched and in their required execution order:

1. `_ensureAuthSession`
2. `_syncSessionStorage`
3. `_seedOnboardingAssistantState`

### 3. Verify Compilation

Run:

```bash
npm run typecheck
```
