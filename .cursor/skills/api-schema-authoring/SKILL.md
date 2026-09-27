---
name: api-schema-authoring
description: Best practices for authoring Zod request and response validation schemas
---

# API Schema Authoring Skill

When testing or intercepting endpoints, define strict validation schemas using Zod.

### 1. Schema Placement

- Place schemas under `schemas/<feature>/<endpoint>.schema.ts`.
- Keep request and response schemas in the same file when both are used by tests.

### 2. Sourcing from OpenAPI / Swagger

- Check backend OpenAPI / Swagger documentation for exact property names, enums, and required vs optional flags.
- Do not invent speculative fields.

### 3. Schema and Type Declaration Pattern

Export both the Zod schema and its TypeScript inferred type:

```ts
import { z } from 'zod';

export const CreatePipelineRequestSchema = z.object({
  name: z.string().min(1),
  sourceId: z.string().uuid(),
  destinationId: z.string().uuid(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type CreatePipelineRequest = z.infer<typeof CreatePipelineRequestSchema>;

export const CreatePipelineResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']),
  createdAt: z.string(),
});

export type CreatePipelineResponse = z.infer<typeof CreatePipelineResponseSchema>;
```

### 4. Handling Optional Fields

Remember that under `exactOptionalPropertyTypes`, optional properties must not be assigned `undefined`. Use `.optional()` in Zod and omit undefined properties when constructing test fixtures or payloads.
