'use client'

import { Trans } from '@lingui/macro'
import { forwardRef } from 'react'
import { VStack } from 'styled-system/jsx'

import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { BitcoinInput, BitcoinOutput, BitcoinTransaction, CkbTransaction } from '@/gql/graphql'

export const BtcTransactionCardInAddress = forwardRef<
  HTMLDivElement,
  {
    tx: Pick<BitcoinTransaction, 'transactionTime' | 'txid' | 'vin' | 'vout' | 'fee' | 'feeRate' | 'confirmations'>
    ckbCell?: Pick<CkbTransaction, 'inputs' | 'outputs'>
    address: string
  }
>(function BtcTransactionCardInAddress({ tx, address, ckbCell }, ref) {
  return (
    <VStack key={tx.txid} w="100%" gap={0} bg="bg.card" rounded="8px" ref={ref}>
      <TransactionHeaderInAddress time={tx.transactionTime} txid={tx.txid} btcTime />
      <BtcUtxoTables
        txid={tx.txid}
        vin={tx.vin as BitcoinInput[]}
        vout={tx.vout as BitcoinOutput[]}
        ckbCell={ckbCell}
        currentAddress={address}
      />
      <UtxoOrCellFooter
        txid={tx.txid}
        fee={tx.fee}
        confirmations={tx.confirmations}
        feeRate={tx.feeRate}
        feeUnit={<Trans>sats</Trans>}
        address={address}
        btcUtxo={{ vin: tx.vin as BitcoinInput[], vout: tx.vout as BitcoinOutput[] }}
        ckbCell={ckbCell}
      />
    </VStack>
  )
})
