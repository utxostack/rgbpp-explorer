import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'

import { BTCTransactionPage } from '@/app/[lang]/transaction/[tx]/btc'
import { CKBTransactionPage } from '@/app/[lang]/transaction/[tx]/ckb'
import { graphql } from '@/gql'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

export const revalidate = 60

const query = graphql(`
  query RgbppTransaction($txidOrTxHash: String!) {
    rgbppTransaction(txidOrTxHash: $txidOrTxHash) {
      ckbTxHash
      btcTxid
      leapDirection
      blockNumber
      timestamp
      btcTransaction {
        blockHeight
        blockHash
        txid
        version
        size
        locktime
        weight
        fee
        feeRate
        confirmed
        confirmations
        vin {
          txid
          vout
          scriptsig
          scriptsigAsm
          isCoinbase
          sequence
          prevout {
            txid
            vout
            scriptpubkey
            scriptpubkeyAsm
            scriptpubkeyType
            scriptpubkeyAddress
            value
            address {
              address
              satoshi
              pendingSatoshi
              transactionsCount
            }
            status {
              spent
              txid
              vin
            }
          }
        }
        vout {
          txid
          vout
          scriptpubkey
          scriptpubkeyAsm
          scriptpubkeyType
          scriptpubkeyAddress
          value
          address {
            address
            satoshi
            pendingSatoshi
            transactionsCount
          }
          status {
            spent
            txid
            vin
          }
        }
      }
      ckbTransaction {
        isCellbase
        blockNumber
        hash
        fee
        feeRate
        size
        confirmed
        confirmations
        outputs {
          txHash
          index
          capacity
          cellType
          type {
            codeHash
            hashType
            args
          }
          lock {
            codeHash
            hashType
            args
          }
          status {
            consumed
            txHash
            index
          }
          xudtInfo {
            symbol
            amount
            decimal
            typeHash
          }
        }
        inputs {
          txHash
          index
          capacity
          cellType
          type {
            codeHash
            hashType
            args
          }
          lock {
            codeHash
            hashType
            args
          }
          xudtInfo {
            symbol
            amount
            decimal
            typeHash
          }
          status {
            consumed
            txHash
            index
          }
        }
        block {
          timestamp
          hash
        }
      }
    }
  }
`)

export default async function Page({ params: { tx } }: { params: { tx: string } }) {
  const i18n = getI18nFromHeaders()
  const res = await graphQLClient.request(query, { txidOrTxHash: tx })
  if (!res?.rgbppTransaction) notFound()

  if (res.rgbppTransaction.btcTransaction && !tx.startsWith('0x')) {
    return (
      <BTCTransactionPage
        btcTransaction={res.rgbppTransaction.btcTransaction as BitcoinTransaction}
        ckbTransaction={res.rgbppTransaction.ckbTransaction as CkbTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }

  if (res.rgbppTransaction.ckbTransaction && tx.startsWith('0x')) {
    return (
      <CKBTransactionPage
        ckbTransaction={res.rgbppTransaction.ckbTransaction as CkbTransaction}
        btcTransaction={res.rgbppTransaction.btcTransaction as BitcoinTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }

  if (res.rgbppTransaction.btcTransaction) {
    return (
      <BTCTransactionPage
        btcTransaction={res.rgbppTransaction.btcTransaction as BitcoinTransaction}
        ckbTransaction={res.rgbppTransaction.ckbTransaction as CkbTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }

  if (res.rgbppTransaction.ckbTransaction) {
    return (
      <CKBTransactionPage
        ckbTransaction={res.rgbppTransaction.ckbTransaction as CkbTransaction}
        btcTransaction={res.rgbppTransaction.btcTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }
  throw new Error(t(i18n)`The transaction "${tx}" not found`)
}
