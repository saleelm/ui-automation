---
name: failure-triage
description: Diagnostic protocol for triaging failed test runs and Playwright traces
---

# Failure Triage Skill

When a test run fails, follow this systematic investigation procedure:

### 1. Inspect Artifacts and Traces

Check `test-results/` for trace archives and failure screenshots:

```bash
npx playwright show-trace test-results/<test-dir>/trace.zip
```

Review the exact action that failed, the locator used, and network responses leading up to the failure.

### 2. Categorize the Failure

Determine which layer caused the failure:

- **Authentication failure**: Setup project failed, tenant features did not return 200, or Keycloak redirected back to login.
- **Timing / Assertion timeout**: Element did not become visible within action timeout (15s) or expect timeout (20s). Check if backend API was slow or onboarding gate reappeared.
- **Locator mismatch / DOM change**: Element was renamed, moved, or altered in product code.
- **Backend / Interception error**: API schema validation error, 500 error from service, or route handler failed to fulfill.

### 3. Report Findings

Every triage report must conclude with two distinct sections:

#### **Root cause**

State the precise technical reason why the test failed (e.g. "The button label changed from 'Add Pipeline' to 'New Pipeline' in build v2.14, causing `loginPage.newPipelineButton` to time out waiting for visibility.").

#### **Summary**

Summarize the impact and recommended fix or next steps clearly and concisely.
