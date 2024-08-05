'use client'

import { Trans } from '@lingui/macro'

import { CellType, CkbTransaction } from '@/apis/types/explorer-graphql'
import { resolveCellDiff } from '@/lib/resolve-cell-diff'
import { formatNumber } from '@/lib/string/format-number'

export function Amount({ ckbTransaction }: { ckbTransaction?: CkbTransaction }) {
  const cellDiff = resolveCellDiff(ckbTransaction)

  if (!ckbTransaction) return <Trans>-</Trans>

  const dobInputCount = ckbTransaction?.inputs.filter(
    (input) => input.cellType === CellType.DOB || input.cellType === CellType.MNFT,
  )
  if (dobInputCount?.length) {
    return (
      <Trans>
        <b>{dobInputCount.length}</b> DOB
      </Trans>
    )
  }

  const dobOutputCount = ckbTransaction?.outputs.filter(
    (output) => output.cellType === CellType.DOB || output.cellType === CellType.MNFT,
  )
  if (dobOutputCount?.length) {
    return (
      <Trans>
        <b>{dobOutputCount.length}</b> DOB
      </Trans>
    )
  }

  return (
    <>
      <b>{formatNumber(cellDiff.value)}</b> {cellDiff.symbol}
    </>
  )
}
