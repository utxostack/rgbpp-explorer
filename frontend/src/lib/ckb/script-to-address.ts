import { scriptToAddress as lockToAddress } from '@nervosnetwork/ckb-sdk-utils'

import { env } from '@/constants/env'

export function scriptToAddress(script: CKBComponents.Script) {
  return lockToAddress(script, env.public.IS_MAINNET)
}
