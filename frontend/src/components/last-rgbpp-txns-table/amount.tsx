'use client'

import { Trans } from '@lingui/macro'

import { Text } from '@/components/ui'
import { CellType, CkbTransaction } from '@/gql/graphql'
import { formatNumber } from '@/lib/string/format-number'

export function Amount({ ckbTransaction }: { ckbTransaction?: Pick<CkbTransaction, 'outputs'> | null }) {
  if (!ckbTransaction) return <Trans>-</Trans>

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

  const cellDiff = ckbTransaction.outputs.find((x) => x.xudtInfo)

  if (!cellDiff) {
    console.log(ckbTransaction.outputs)
    return <Trans>-</Trans>
  }

  return (
    <>
      <b>{formatNumber(cellDiff.xudtInfo?.amount, cellDiff.xudtInfo?.decimal)}</b>
      <Text as="span" color="text.third" fontSize="14px" fontWeight="medium" ml="4px">
        {cellDiff.xudtInfo?.symbol}
      </Text>
    </>
  )
}
