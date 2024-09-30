'use client'

import { Trans } from '@lingui/macro'
import { HStack, VStack } from 'styled-system/jsx'

import { BtcOutputsSum } from '@/components/btc/btc-outputs-sum'
import { BtcTransactionInViewQuery } from '@/components/btc/btc-transaction-in-view-query'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { BitcoinInput, BitcoinOutput } from '@/gql/graphql'

export function BtcTransactionCardWithQueryInBlock({ txid }: { txid: string }) {
  return (
    <BtcTransactionInViewQuery txid={txid}>
      {(tx) => (
        <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={tx.txid}>
          <TransactionHeaderInAddress time={tx.transactionTime} txid={tx.txid} btcTime />
          <BtcUtxoTables txid={tx.txid} vin={tx.vin as BitcoinInput[]} vout={tx.vout as BitcoinOutput[]} />
          <UtxoOrCellFooter fee={tx.fee} feeRate={tx.feeRate} feeUnit={<Trans>sats</Trans>}>
            <HStack gap="16px" flexWrap="wrap" justify={{ base: 'start', lg: 'end' }}>
              <BtcOutputsSum vout={tx.vout as BitcoinOutput[]} />
            </HStack>
          </UtxoOrCellFooter>
        </VStack>
      )}
    </BtcTransactionInViewQuery>
  )
}
