import type { Script } from '@ckb-lumos/lumos'
import { isRgbppLockCell as isRgbppLockCellRaw } from '@rgbpp-sdk/ckb'

import { env } from '@/constants/env'
import { CkbCell } from '@/gql/graphql'

export function isRgbppLockCell(ckbCell: CkbCell) {
  return isRgbppLockCellRaw(
    {
      capacity: `${ckbCell.capacity}`,
      lock: ckbCell.lock as Script,
      type: ckbCell.type as Script,
    },
    env.public.IS_MAINNET,
  )
}
