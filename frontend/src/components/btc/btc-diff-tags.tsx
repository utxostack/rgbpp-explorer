import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { compact, sum, uniqBy } from 'lodash-es'
import { Flex } from 'styled-system/jsx'

import MoneyIcon from '@/assets/money.svg'
import { parseRgbppLockArgs } from '@/components/ckb/parse-rgbpp-lock-args'
import { BitcoinInput, BitcoinOutput, CellType, CkbTransaction } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { isRgbppLockCell } from '@/lib/ckb/is-rgbpp-lock-cell'
import { formatNumber } from '@/lib/string/format-number'

export function BtcDiffTags({
  vin = [],
  vout = [],
  ckbCell,
  address,
}: {
  vin?: BitcoinInput[]
  vout?: BitcoinOutput[]
  address: string
  ckbCell?: Pick<CkbTransaction, 'inputs' | 'outputs'>
}) {
  const inputBalance = sum(
    compact(vin.filter((x) => address === x.prevout?.address?.address).map((x) => x.prevout?.value)),
  )
  const outputBalance = sum(compact(vout.filter((x) => address === x.address?.address).map((x) => x.value)))
  const diff = satsToBtc(BigNumber(outputBalance).minus(BigNumber(inputBalance)))

  const inputs = vin
    .map((input) => {
      const cell = ckbCell?.inputs?.find((cell) => {
        if (!isRgbppLockCell(cell)) return false
        const { btcTxid, outIndex } = parseRgbppLockArgs(cell.lock.args)
        return !(btcTxid !== input.txid || input.vout !== outIndex)
      })
      return { cell, input }
    })
    .filter((x) => x.cell)
  const outputs = vout
    .map((output, i) => {
      const cell = ckbCell?.outputs?.find((cell) => {
        if (!isRgbppLockCell(cell)) return false
        const { btcTxid, outIndex } = parseRgbppLockArgs(cell.lock.args)
        return !(outIndex !== i || !vout[outIndex] || btcTxid !== output.txid)
      })
      return { cell, output }
    })
    .filter((x) => x.cell)

  const allXudt = uniqBy(compact(inputs.map((x) => x.cell?.xudtInfo)), (x) => x?.symbol)
  const xudtTags = allXudt.map((xudt) => {
    const balance = inputs
      .filter((x) => x.input.prevout?.address?.address === address && x.cell?.xudtInfo?.symbol === xudt?.symbol)
      .reduce((acc, x) => acc.plus(x.cell?.xudtInfo?.amount || 0), BigNumber(0))
    const xudtBalanceWithoutThisAddress = outputs
      .filter((x) => x.output?.address?.address === address && x.cell?.xudtInfo?.symbol === xudt?.symbol)
      .reduce((acc, x) => acc.plus(x.cell?.xudtInfo?.amount || 0), BigNumber(0))
    const diff = BigNumber(xudtBalanceWithoutThisAddress).minus(BigNumber(balance))
    return !diff.isZero() ? (
      <Flex
        align="center"
        py="8px"
        fontSize="14px"
        lineHeight="16px"
        px="16px"
        rounded="4px"
        bg={diff.isGreaterThan(0) ? 'success' : 'danger'}
      >
        <Trans>
          {diff.isGreaterThan(0) ? '+' : ''}
          {formatNumber(diff, xudt?.decimal)} {xudt?.symbol}
        </Trans>
        <MoneyIcon w="16px" h="16px" ml="6px" />
      </Flex>
    ) : null
  })

  // dob
  const inputDobs = inputs.filter(
    (x) =>
      (x.cell?.cellType === CellType.Dob || x.cell?.cellType === CellType.Mnft) &&
      x.input.prevout?.address?.address === address,
  )
  const outputDobs = outputs.filter(
    (x) =>
      (x.cell?.cellType === CellType.Dob || x.cell?.cellType === CellType.Mnft) &&
      x.output?.address?.address === address,
  )
  const dobDiff = BigNumber(outputDobs.length).minus(inputDobs.length)

  return (
    <>
      {!diff.isZero() ? (
        <Flex
          align="center"
          py="8px"
          fontSize="14px"
          lineHeight="16px"
          px="16px"
          rounded="4px"
          bg={diff.isGreaterThan(0) ? 'success' : 'danger'}
        >
          <Trans>{formatNumber(diff)} BTC</Trans>
          <MoneyIcon w="16px" h="16px" ml="6px" />
        </Flex>
      ) : null}
      {xudtTags}
      {!dobDiff.isZero() ? (
        <Flex
          align="center"
          py="8px"
          fontSize="14px"
          lineHeight="16px"
          px="16px"
          rounded="4px"
          bg={dobDiff.isGreaterThan(0) ? 'success' : 'danger'}
        >
          <Trans>{formatNumber(dobDiff)} DOB</Trans>
          <MoneyIcon w="16px" h="16px" ml="6px" />
        </Flex>
      ) : null}
    </>
  )
}
