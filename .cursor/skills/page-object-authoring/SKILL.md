---
name: page-object-authoring
description: Standards and patterns for creating page objects extending BasePage in the application
---

# Page Object Authoring Skill

Follow these steps when creating or extending page objects in `ui-test-platform`:

### 1. File Location and Extension

- Create the page object at `pages/<feature>.page.ts`.
- Every application page object must extend `BasePage` from `pages/base.page.js`.

### 2. Constructor and Locator Definitions

- Keep locators as `readonly Locator` properties initialized in the constructor, or as accessor methods if parameterized.
- Prioritize user-facing roles, labels, and visible text:
  ```ts
  import type { Locator, Page } from '@playwright/test';
  import { BasePage } from '../base.page.js';
  import { AppConfig } from '../../config/app.config.js';

  export class PipelinesPage extends BasePage {
    readonly newPipelineButton: Locator;
    readonly searchInput: Locator;
    readonly pipelineList: Locator;

    constructor(page: Page) {
      super(page);
      this.newPipelineButton = page.getByRole('button', { name: 'New Pipeline' });
      this.searchInput = page.getByLabel('Search pipelines');
      this.pipelineList = page.getByTestId('pipeline-grid');
    }
  }
  ```

### 3. Readiness Navigation (`navigate()`)

- Implement `navigate()` to call `goto()` and wait for 1–2 visible anchors confirming interactive readiness:
  ```ts
  async navigate(): Promise<void> {
    await this.goto('/pipelines');
    await this.newPipelineButton.waitFor({
      state: 'visible',
      timeout: AppConfig.timeouts.action,
    });
  }
  ```

### 4. API Waits via `BasePage`

- Delegate network waits to `this.waitForApiResponse`:
  ```ts
  async waitForPipelinesLoaded(): Promise<void> {
    await this.waitForApiResponse({
      method: 'GET',
      urlIncludes: '/v2/pipelines',
      status: 200,
    });
  }
  ```

### 5. Boundaries

- Do not add test assertions that orchestrate full test flows.
- Never use `waitForTimeout`.
- Register the newly created page object in `fixtures/pom/page-object-fixture.ts`.
