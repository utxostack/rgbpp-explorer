import BigNumber from 'bignumber.js'

export function satsToBtc(sats: BigNumber.Value) {
  return BigNumber(sats).div(BigNumber(10).pow(8))
}
