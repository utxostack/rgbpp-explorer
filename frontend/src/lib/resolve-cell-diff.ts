import BigNumber from 'bignumber.js'

import { CkbTransaction } from '@/gql/graphql'
import { scriptToAddress } from '@/lib/ckb/script-to-address'

export function resolveCellDiff(tx?: Pick<CkbTransaction, 'inputs' | 'outputs'> | null) {
  const xudtInfo = tx?.inputs?.find((x) => x.xudtInfo)?.xudtInfo
  if (!xudtInfo) {
    return {
      value: BigNumber(0),
      symbol: 'xUDT',
    }
  }
  const symbol = xudtInfo.symbol
  const decimal = xudtInfo.decimal ?? 1
  const lockScript = tx?.inputs?.[0].lock ? scriptToAddress(tx?.inputs?.[0].lock) : undefined
  const inputValue = tx?.inputs
    ?.filter((input) => input.xudtInfo && input.xudtInfo.symbol === symbol)
    .reduce((acc, input) => acc.plus(input.xudtInfo!.amount), BigNumber(0))
  const outputValue = tx?.outputs
    .filter(
      (output) => output.xudtInfo && output.xudtInfo.symbol === symbol && scriptToAddress(output.lock) === lockScript,
    )
    .reduce((acc, output) => acc.plus(output.xudtInfo!.amount), BigNumber(0))
  return {
    value: inputValue?.minus(outputValue ?? 0).div(BigNumber(10).pow(decimal)) ?? BigNumber(0),
    symbol,
  }
}
