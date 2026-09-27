---
name: api-interception
description: Complete guide for intercepting, modifying, and validating browser API traffic
---

# API Interception Skill

The framework provides five specialized intercept helpers in `helpers/api/` to validate and control browser network traffic during test execution.

### Pattern 1: `interceptValidateAndDrop`

Validates the outgoing request payload against a Zod schema, executes an optional callback, and aborts the request before it reaches the network (`route.abort('failed')`).

```ts
const unroute = await interceptValidateAndDrop(
  page,
  AuthApiConstants.token.pattern,
  LoginRequestSchema,
  (payload) => {
    expect(payload.username).toBe(AppConfig.credentials.email);
  },
);
try {
  await loginPage.login(AppConfig.credentials.email, AppConfig.credentials.password);
} finally {
  await unroute();
}
```

### Pattern 2: `interceptValidateAndContinue`

Validates the outgoing request payload with a Zod schema, invokes an optional callback with `{ method, payload, status, url }`, and allows the request to continue to the backend. Supports `method` and `urlExcludes` filters.

```ts
const unroute = await interceptValidateAndContinue(
  page,
  /.*\/v2\/destinations/,
  DestinationRequestSchema,
  {
    method: 'POST',
    onIntercept: (info) => {
      expect(info.payload.name).toContain('test-');
    },
  },
);
```

### Pattern 3: `interceptModifyResponse`

Fetches the real response from the backend, overrides specified top-level JSON fields, and fulfills the route.

```ts
const unroute = await interceptModifyResponse(page, /.*\/v2\/tenant\/features/, {
  betaFeaturesEnabled: true,
});
```

### Pattern 4: `interceptPassthroughMutate`

Fetches the real response from the backend, passes the JSON through a mutator callback function, and fulfills with the mutated response.

```ts
const unroute = await interceptPassthroughMutate(
  page,
  /.*\/v2\/pipelines/,
  (pipelinesList: PipelineItem[]) => {
    return pipelinesList.filter((p) => p.status === 'RUNNING');
  },
);
```

### Pattern 5: `interceptFulfillJson`

Fulfills the route immediately with a mock JSON body without hitting the network.

```ts
const unroute = await interceptFulfillJson(page, /.*\/v2\/alerts/, { alerts: [] }, 200);
```

### Unroute Lifecycle Rule

Every intercept function returns a `RouteCleanup` promise. Always unroute the handler inside a `finally` block or immediately after the assertion so subsequent steps receive unaltered network behavior.
