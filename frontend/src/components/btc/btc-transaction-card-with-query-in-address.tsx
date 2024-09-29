'use client'

import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { BtcTransactionInViewQuery } from '@/components/btc/btc-transaction-in-view-query'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'

interface Props {
  txid: string
  ckbTxHash?: string
  address: string
}

export function BtcTransactionCardWithQueryInAddress({ txid, address }: Props) {
  return (
    <BtcTransactionInViewQuery txid={txid}>
      {(data, ckbTx) => (
        <BtcTransactionCardInAddress
          tx={data as BitcoinTransaction}
          address={address}
          ckbCell={ckbTx as Pick<CkbTransaction, 'inputs' | 'outputs'>}
        />
      )}
    </BtcTransactionInViewQuery>
  )
}
