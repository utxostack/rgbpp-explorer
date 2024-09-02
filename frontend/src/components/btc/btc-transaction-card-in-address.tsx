'use client'

import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { VStack } from 'styled-system/jsx'

import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { BitcoinInput, BitcoinOutput, BitcoinTransaction, CkbTransaction } from '@/gql/graphql'

export function BtcTransactionCardInAddress({
  tx,
  address,
  ckbCell,
}: {
  tx: BitcoinTransaction
  ckbCell?: CkbTransaction
  address: string
}) {
  const { i18n } = useLingui()
  return (
    <VStack key={tx.txid} w="100%" gap={0} bg="bg.card" rounded="8px">
      <TransactionHeaderInAddress time={tx.transactionTime} txid={tx.txid} btcTime />
      <BtcUtxoTables
        txid={tx.txid}
        vin={tx.vin as BitcoinInput[]}
        vout={tx.vout as BitcoinOutput[]}
        ckbCell={ckbCell}
        currentAddress={address}
      />
      <UtxoOrCellFooter
        fee={tx.fee}
        confirmations={tx.confirmations}
        feeRate={tx.feeRate}
        feeUnit={t(i18n)`sats`}
        address={address}
        btcUtxo={{ vin: tx.vin as BitcoinInput[], vout: tx.vout as BitcoinOutput[] }}
        ckbCell={ckbCell}
      />
    </VStack>
  )
}
