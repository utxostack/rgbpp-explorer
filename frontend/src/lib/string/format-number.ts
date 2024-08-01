import BigNumber from 'bignumber.js'
import { isNaN, isNull, isUndefined } from 'lodash-es'

export function formatNumber(value?: BigNumber.Value, decimal?: number) {
  if (isUndefined(value) || isNull(value) || isNaN(value)) return '-'
  const val = BigNumber(value)
  if (decimal) {
    return val.div(BigNumber(10).pow(decimal)).toFormat()
  }
  return val?.toFormat() ?? '-'
}
