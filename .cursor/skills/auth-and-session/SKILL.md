---
name: auth-and-session
description: Guide to ion session management, Keycloak tokens, and storage state
---

# Auth and Session Skill

ication uses a multi-tenant authentication system integrated with Keycloak OIDC.

### Session Architecture

1. **Hybrid Storage**:
   - The session relies on both `localStorage` and `sessionStorage`.
   - Keys include `oidc.user:<authority>:<clientId>`, `user_auth_token`, `user`, `oidc-config-variables`, and `commonDataPlaneId`.
   - The framework's `_syncSessionStorage` auto fixture copies these items automatically.

2. **Setup Project (`tests/auth.setup.ts`)**:
   - Runs before tests in the `chrome` project.
   - Executes `bootstrapAuthStorageState`:
     1. Starts waiting for `GET /v2/tenant/features`.
     2. Authenticates via token (password grant) or UI (two-step login) based on `AUTH_MODE`.
     3. Asserts tenant features status `200`.
     4. Waits for URL host match and non-Keycloak path.
     5. Applies onboarding bypass flags.
     6. Writes session state to `playwright/.auth/userSession.json`.

3. **Per-Test Freshness**:
   - When `AUTH_MODE=token`, `_ensureAuthSession` re-injects a fresh access token before each test.
   - When `AUTH_MODE=ui`, the stored session state is reused without re-injecting.

4. **Testing Unauthenticated Scenarios**:
   - To test unauthenticated views or redirect gates, override the storage state:
     ```ts
     test.use({
       storageState: { cookies: [], origins: [] },
       authSessionMode: 'skip',
     });
     ```
