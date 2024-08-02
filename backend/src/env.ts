import z from 'zod';
import { NetworkType } from './constants';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NETWORK: z.enum([NetworkType.mainnet, NetworkType.testnet]).default(NetworkType.testnet),
    ENABLED_GRAPHQL_PLAYGROUND: z.boolean().default(true),

    // DATABASE_URL: z.string(),
    REDIS_URL: z.string(),

    BITCOIN_PRIMARY_DATA_PROVIDER: z.enum(['mempool', 'electrs']).default('mempool'),

    CKB_EXPLORER_API_URL: z.string(),
    CKB_RPC_WEBSOCKET_URL: z.string(),

    SENTRY_DSN: z.string().optional(),
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
