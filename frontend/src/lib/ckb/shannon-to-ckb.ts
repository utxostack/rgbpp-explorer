import BigNumber from 'bignumber.js'

export function shannonToCKB(shannon: BigNumber.Value) {
  return BigNumber(shannon).div(BigNumber(10).pow(8))
}
