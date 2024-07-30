import { z } from 'zod'

const internalEnvSchema = z.object({})

const zodStringBoolean = z
  .string()
  .toLowerCase()
  .transform((x) => x === 'true')
  .pipe(z.boolean())

const publicEnvSchema = z.object({
  CKB_EXPLORER_URL: z.string().default('https://explorer.nervos.org'),
  MEMPOOL_URL: z.string().default('https://mempool.space'),
  IS_MAINNET: zodStringBoolean.default('true'),
})

const sharedEnvSchema = z.object({
  RGBPP_EXPLORER_API_URL: z.string().default('https://testnet-api.explorer.rgbpp.io/graphql'),
})

export const env = {
  share: sharedEnvSchema.parse({
    RGBPP_EXPLORER_API_URL: process.env.NEXT_PUBLIC_RGBPP_EXPLORER_API_URL,
  }),
  internal: (typeof window === 'undefined' ? internalEnvSchema.parse(process.env) : {}) as z.infer<
    typeof internalEnvSchema
  >,
  public: publicEnvSchema.parse({
    CKB_EXPLORER_URL: process.env.NEXT_PUBLIC_CKB_EXPLORER_URL,
    MEMPOOL_URL: process.env.NEXT_PUBLIC_MEMPOOL_URL,
    IS_MAINNET: process.env.NEXT_PUBLIC_IS_MAINNET,
  }),
}
