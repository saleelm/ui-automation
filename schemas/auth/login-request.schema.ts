import { z } from 'zod';

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  client_id: z.string().min(1),
  grant_type: z.string().min(1),
  scope: z.string().min(1).optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
