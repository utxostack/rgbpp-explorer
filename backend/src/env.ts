import z from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
});
