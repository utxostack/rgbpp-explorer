import BigNumber from 'bignumber.js'

export function formatNumber(value?: BigNumber.Value, decimal?: number) {
  if (!value) return '-'
  const val = BigNumber(value)
  if (decimal) {
    return val.div(BigNumber(10).pow(decimal)).toFormat()
  }
  return val?.toFormat() ?? '-'
}
