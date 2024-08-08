import { scriptToAddress as lockToAddress } from '@nervosnetwork/ckb-sdk-utils'

import { env } from '@/constants/env'
import type { CkbScript } from '@/gql/graphql'

export function scriptToAddress(script: CKBComponents.Script | CkbScript) {
  return lockToAddress(script as CKBComponents.Script, env.public.IS_MAINNET)
}
