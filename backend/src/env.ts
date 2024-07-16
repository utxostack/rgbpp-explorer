import z from 'zod';

export const envSchema = z.object({
  // DATABASE_URL: z.string(),
  // REDIS_URL: z.string(),

  CKB_EXPLORER_API_ENDPOINT: z.string(),
});

export type Env = z.infer<typeof envSchema>;
