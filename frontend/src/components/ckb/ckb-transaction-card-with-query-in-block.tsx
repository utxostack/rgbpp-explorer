'use client'

import { Trans } from '@lingui/macro'
import { HStack, VStack } from 'styled-system/jsx'

import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { CkbOutputsSum } from '@/components/ckb/ckb-outputs-sum'
import { CkbTransactionInViewQuery } from '@/components/ckb/ckb-transaction-in-view-query'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'

export function CkbTransactionCardWithQueryInBlock({ hash, timestamp }: { hash: string; timestamp: number }) {
  return (
    <CkbTransactionInViewQuery hash={hash}>
      {(tx) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={tx.hash}>
            <TransactionHeaderInAddress time={timestamp} txid={tx.hash} />
            <CkbCellTables inputs={tx.inputs} outputs={tx.outputs} isCellbase={tx.isCellbase} />
            <UtxoOrCellFooter fee={tx.fee} feeRate={tx.feeRate} feeUnit={<Trans>sats</Trans>}>
              <HStack gap="16px" flexWrap="wrap" justify={{ base: 'start', lg: 'end' }}>
                <CkbOutputsSum outputs={tx.outputs} />
              </HStack>
            </UtxoOrCellFooter>
          </VStack>
        )
      }}
    </CkbTransactionInViewQuery>
  )
}
