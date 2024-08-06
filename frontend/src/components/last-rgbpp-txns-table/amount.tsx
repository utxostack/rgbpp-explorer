'use client'

import { Trans } from '@lingui/macro'

import { Text } from '@/components/ui'
import { CellType, CkbTransaction } from '@/gql/graphql'
import { resolveCellDiff } from '@/lib/resolve-cell-diff'
import { formatNumber } from '@/lib/string/format-number'

export function Amount({ ckbTransaction }: { ckbTransaction?: Pick<CkbTransaction, 'inputs' | 'outputs'> | null }) {
  if (!ckbTransaction) return <Trans>-</Trans>

  const dobInputCount = ckbTransaction?.inputs.filter(
    (input) => input.cellType === CellType.Dob || input.cellType === CellType.Mnft,
  )

  if (dobInputCount?.length) {
    return (
      <Trans>
        <b>{dobInputCount.length}</b>
        <Text as="span" color="text.third" fontSize="14px" fontWeight="medium" ml="4px">
          DOB
        </Text>
      </Trans>
    )
  }

  const dobOutputCount = ckbTransaction?.outputs.filter(
    (output) => output.cellType === CellType.Dob || output.cellType === CellType.Mnft,
  )
  if (dobOutputCount?.length) {
    return (
      <Trans>
        <b>{dobOutputCount.length}</b>
        <Text as="span" color="text.third" fontSize="14px" fontWeight="medium" ml="4px">
          DOB
        </Text>
      </Trans>
    )
  }

  const cellDiff = resolveCellDiff(ckbTransaction)

  return (
    <>
      <b>{formatNumber(cellDiff.value)}</b>
      <Text as="span" color="text.third" fontSize="14px" fontWeight="medium" ml="4px">
        {cellDiff.symbol}
      </Text>
    </>
  )
}
