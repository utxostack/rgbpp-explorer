import BigNumber from 'bignumber.js'
import { isNumber } from 'lodash-es'

export function formatNumber(value?: BigNumber.Value, decimal?: number) {
  const val = isNumber(value) || BigNumber.isBigNumber(value) ? BigNumber(value) : undefined
  if (decimal && val) {
    return val.div(BigNumber(10).pow(decimal)).toFormat()
  }
  return val?.toFormat() ?? '-'
}
