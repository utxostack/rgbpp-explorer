import z from 'zod';

export const envSchema = z
  .object({
    // DATABASE_URL: z.string(),
    // REDIS_URL: z.string(),

    BITCOIN_PRIMARY_DATA_PROVIDER: z.enum(['mempool', 'electrs']),

    CKB_EXPLORER_API_URL: z.string(),
    CKB_RPC_WEBSOCKET_URL: z.string(),
  })
  .and(
    z.union([
      z.object({
        BITCOIN_PRIMARY_DATA_PROVIDER: z.literal('mempool'),
        BITCOIN_MEMPOOL_SPACE_API_URL: z.string(),
        BITCOIN_ELECTRS_API_URL: z.string().optional(),
      }),
      z.object({
        BITCOIN_PRIMARY_DATA_PROVIDER: z.literal('electrs').default('electrs'),
        BITCOIN_ELECTRS_API_URL: z.string(),
        BITCOIN_MEMPOOL_SPACE_API_URL: z.string().optional(),
      }),
    ]),
  );
export type Env = z.infer<typeof envSchema>;
