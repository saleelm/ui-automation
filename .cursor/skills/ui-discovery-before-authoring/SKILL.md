---
name: ui-discovery-before-authoring
description: Step-by-step workflow for discovering DOM structure and locators using Playwright CLI
---

# UI Discovery Before Authoring Skill

Never guess page structures, button names, or locator paths. Always use real-time UI discovery.

### Step 1: Resolve Environment and Bootstrap Auth

Identify the target environment from `debug_env` (default `staging`). Run the setup project to ensure a valid session exists:

```bash
ENVIRONMENT=staging npx playwright test --project=setup
```

Ensure `playwright/.auth/userSession.json` is generated.

### Step 2: Open Discovery Session

Run Playwright CLI with the saved authenticated session and target base URL:

```bash
npx playwright codegen --load-storage=playwright/.auth/userSession.json https://staging.com
```

### Step 3: Inspect Interactive Elements

1. **Identify Readiness Anchors**: Find 1–2 elements that become visible only after asynchronous page data finishes rendering (e.g., table header, "Create" button, summary badge).
2. **Record Locators**: Note user-facing roles and labels. Prefer `getByRole`, `getByLabel`, `getByText`.
3. **Inspect Network Activity**: In DevTools, observe which API routes are triggered when the page loads (for `waitForApiResponse`).

### Step 4: Validate Discovery

- If the environment is unreachable, credentials fail, or elements cannot be found, **stop immediately**. Report the blocker to the user rather than guessing selectors.
