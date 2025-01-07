# RGB++ Explorer Backend

This is the backend service for the RGB++ Explorer, built with NestJS and GraphQL.

## Features

- GraphQL API with Apollo Server
- Integration with CKB and Bitcoin networks
- RGB++ specific functionality
- Background indexing job processing with BullMQ
- Sentry integration for error tracking and performance monitoring

## Prerequisites

- Node.js + pnpm (version specified in package.json)
- PostgreSQL
- Redis

## Get Started

### Install dependencies:

```bash
pnpm install
```

### Set up environment variables:

- Copy .env.example to .env and fill in the required environment variables.
- The application uses environment-specific configuration files. Refer to the following file for configuration options:

```typescript
import z from 'zod';
import { NetworkType } from './constants';

export const envSchema = z
  .object({
    // Application runtime environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Network type: mainnet or testnet
    NETWORK: z.enum([NetworkType.mainnet, NetworkType.testnet]).default(NetworkType.testnet),
    // Logging level
    LOGGER_LEVEL: z.enum(['verbose', 'debug', 'log', 'warn', 'error']).default('log'),
    // Enable or disable GraphQL Playground
    ENABLED_GRAPHQL_PLAYGROUND: z
      .string()
      .default('true')
      .transform((value) => value === 'true'),

    // GraphQL complexity limit, default to 1000
    GRAPHQL_COMPLEXITY_LIMIT: z.coerce.number().default(1000),
    // Number of indexing cluster workers, default to 2
    CLUSTER_WORKERS_NUM: z.coerce.number().default(2),

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

    // Database connection URL
    DATABASE_URL: z.string(),
    // Redis cache connection URL
    REDIS_CACHE_URL: z.string(),
    // Redis queue connection URL
    REDIS_QUEUE_URL: z.string(),

    // Primary Bitcoin data provider
    BITCOIN_PRIMARY_DATA_PROVIDER: z.enum(['mempool', 'electrs']).default('mempool'),

    // CKB Explorer API URL
    CKB_EXPLORER_API_URL: z.string(),
    // CKB RPC WebSocket URL
    CKB_RPC_WEBSOCKET_URL: z.string(),

    // Sentry DSN for error tracking (optional)
    SENTRY_DSN: z.string().optional(),

    // Cache key prefix
    CACHE_KEY_PREFIX: z.string().default('rgbpp-explorer@v1'),

    // Rate limit window in milliseconds, default to 60 seconds
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
    // Rate limit per minute, default to 100
    RATE_LIMIT_PER_MINUTE: z.coerce.number().default(100),

    // Git branch (optional)
    GIT_BRANCH: z.string().optional(),
  })
  .and(
    z.union([
      // Configuration for Mempool as primary data provider
      z.object({
        BITCOIN_PRIMARY_DATA_PROVIDER: z.literal('mempool'),
        BITCOIN_MEMPOOL_SPACE_API_URL: z.string(),
        BITCOIN_ELECTRS_API_URL: z.string().optional(),
      }),
      // Configuration for Electrs as primary data provider
      z.object({
        BITCOIN_PRIMARY_DATA_PROVIDER: z.literal('electrs').default('electrs'),
        BITCOIN_ELECTRS_API_URL: z.string(),
        BITCOIN_MEMPOOL_SPACE_API_URL: z.string().optional(),
      }),
    ]),
  );

export type Env = z.infer<typeof envSchema>;
```

### Running the Application

To start the application in development mode:

```bash
pnpm run start:dev
```

For production, use:

```bash
pnpm run build
pnpm run start:prod
```

## Development

- GraphQL schema is automatically generated. You can find it in src/schema.gql.
- Use Prisma for database operations. After making changes to the Prisma schema, run:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

## Deployment

The project includes a Docker configuration. You can build and run the Docker image for deployment.

## Project Structure

```
backend/
├── src/
│   ├── core/                      # Core modules
│   │   ├── bitcoin-api/           # Bitcoin API integration
│   │   ├── blockchain/            # CKB-like blockchain API integration
│   │   ├── ckb-explorer/          # CKB Explorer integration
│   │   ├── ckb-rpc/               # CKB RPC client (blockchain module wrapper)
│   │   ├── database/              # Database connection and ORM
│   │   ├── health/                # Health check endpoints
│   │   └── indexer/               # Blockchain indexing (indexing RGB++ data)
│   ├── modules/                   # Feature modules
│   │   ├── bitcoin/               # Bitcoin related graphql implementation
│   │   ├── ckb/                   # CKB related graphql implementation
│   │   ├── rgbpp/                 # RGB++ protocol related graphql implementation
│   │   └── search/
│   ├── common/                    # Shared utilities and types
│   ├── decorators/                # Custom decorators
│   ├── middlewares/               # GraphQL middlewares
│   ├── app.module.ts              # Main application module
│   ├── bootstrap.service.ts       # Application bootstrap (mainly for indexing)
│   ├── env.ts                     # Environment configuration
│   ├── instrument.ts              # Sentry setup
│   ├── main.ts                    # Application entry point
│   └── schema.gql                 # Generated GraphQL schema
├── prisma/                        # Prisma ORM configuration
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── test/
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```
