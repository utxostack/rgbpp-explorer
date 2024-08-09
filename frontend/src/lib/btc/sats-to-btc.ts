import BigNumber from 'bignumber.js'

export function satsToBtc(sats?: BigNumber.Value | null) {
  return BigNumber(sats ?? 0).div(BigNumber(10).pow(8))
}
