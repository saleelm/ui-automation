---
name: spec-authoring
description: Best practices and standards for authoring Playwright test specs in ui-test-platform
---

# Spec Authoring Skill

Follow this process when authoring new test specs in `ui-test-platform`:

### 1. File Placement

- Store tests under `tests/<feature>/<feature>.spec.ts`.
- Avoid creating deep nesting beyond the feature directory.

### 2. Required Imports

Always import `test` and `expect` exclusively from `fixtures/pom/test-options.js`. Do not import from `@playwright/test`.
Relative imports must include the `.js` extension.

```ts
import { expect, test } from '../../fixtures/pom/test-options.js';
import { AppConfig } from '../../config/app.config.js';
import { Tag } from '../../enums/tags.enum.js';
```

### 3. Title and Metadata Formatting

- Format: `TC## should <verb> <subject> [with/when <condition>]`
- Tags array using `Tag` enum:
  1. Scope: `Tag.Regression` (default), `Tag.Smoke` (critical path), or `Tag.E2e`
  2. Feature/Module: e.g. `Tag.Destination`, `Tag.Pipeline`, `Tag.Login`
  3. Context: `Tag.Api` (if validating traffic), `Tag.Destructive` (if mutating persistent resources)

### 4. Given/When/Then Steps

Structure the test body using `test.step()` blocks representing domain intent:

```ts
test.describe('Destination Management', () => {
  test(
    'TC01 should create a snowflake destination when valid credentials are provided',
    { tag: [Tag.Regression, Tag.Destination] },
    async ({ snowflakeDestinationPage }) => {
      await test.step('Given the user is on the snowflake destination form', async () => {
        await snowflakeDestinationPage.navigate();
      });

      await test.step('When the user fills the configuration and submits', async () => {
        await snowflakeDestinationPage.fillConfiguration({ ... });
        await snowflakeDestinationPage.submit();
      });

      await test.step('Then the destination should appear active in the list', async () => {
        await snowflakeDestinationPage.expectDestinationActive();
      });
    },
  );
});
```

### 5. Verification

After authoring, run:

```bash
npm run typecheck
```
