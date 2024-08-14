import z from 'zod';
import { NetworkType } from './constants';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NETWORK: z.enum([NetworkType.mainnet, NetworkType.testnet]).default(NetworkType.testnet),
    ENABLED_GRAPHQL_PLAYGROUND: z
      .string()
      .default('true')
      .transform((value) => value === 'true'),

    /**
     * CORS origin whitelist (split by comma)
     */
    CORS_WHITELIST: z
      .string()
      .default('')
      .transform((value) => {
        const origin = value.split(',');
        return origin.map((host) => host.trim());
      }),

    // DATABASE_URL: z.string(),
    REDIS_URL: z.string(),

    BITCOIN_PRIMARY_DATA_PROVIDER: z.enum(['mempool', 'electrs']).default('mempool'),

    CKB_EXPLORER_API_URL: z.string(),
    CKB_RPC_WEBSOCKET_URL: z.string(),

    SENTRY_DSN: z.string().optional(),

    CACHE_KEY_PREFIX: z.string().default('rgbpp-explorer@v1'),

    GIT_BRANCH: z.string().optional(),
    APP_VERSION: z.string().optional(),
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
