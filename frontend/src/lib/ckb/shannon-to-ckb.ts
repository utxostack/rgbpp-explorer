import BigNumber from 'bignumber.js'

export function shannonToCKB(shannon?: BigNumber.Value | null) {
  return BigNumber(shannon ?? 0).div(BigNumber(10).pow(8))
}
