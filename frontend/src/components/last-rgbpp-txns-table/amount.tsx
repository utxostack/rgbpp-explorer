'use client'

import { Trans } from '@lingui/macro'

import { CellType, CkbTransaction } from '@/apis/types/explorer-graphql'
import { resolveCellDiff } from '@/lib/resolve-cell-diff'
import { formatNumber } from '@/lib/string/format-number'

export function Amount({ ckbTransaction }: { ckbTransaction?: CkbTransaction }) {
  const cellDiff = resolveCellDiff(ckbTransaction)

  if (!ckbTransaction) return <Trans>-</Trans>

  const dobInput =
    ckbTransaction?.inputs.find((input) => input.cellType === CellType.DOB || input.cellType === CellType.MNFT) ||
    ckbTransaction?.outputs.find((input) => input.cellType === CellType.DOB || input.cellType === CellType.MNFT)

  if (dobInput) {
    return (
      <Trans>
        <b>1</b> DOB
      </Trans>
    )
  }

  return (
    <>
      <b>{formatNumber(cellDiff.value)}</b> {cellDiff.symbol}
    </>
  )
}
