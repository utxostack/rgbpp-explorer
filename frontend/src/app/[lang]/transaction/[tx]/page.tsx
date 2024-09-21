import { notFound } from 'next/navigation'

import { BTCTransactionPage } from '@/app/[lang]/transaction/[tx]/btc'
import { CKBTransactionPage } from '@/app/[lang]/transaction/[tx]/ckb'
import { graphql } from '@/gql'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'

export const revalidate = 60
export const dynamic = 'force-static'

const rgbppTxQuery = graphql(`
  query RgbppTransaction($txidOrTxHash: String!) {
    rgbppTransaction(txidOrTxHash: $txidOrTxHash) {
      ckbTxHash
      btcTxid
      leapDirection
      blockNumber
      timestamp
      btcTransaction {
        txid
        blockHeight
        blockHash
        size
        fee
        feeRate
        confirmed
        confirmations
        vin {
          txid
          vout
          isCoinbase
          prevout {
            txid
            vout
            value
            address {
              address
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
          value
          address {
            address
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
const btcTxQuery = graphql(`
  query BtcTx($txid: String!) {
    btcTransaction(txid: $txid) {
      blockHeight
      blockHash
      txid
      version
      size
      transactionTime
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
  }
`)
const ckbTxQuery = graphql(`
  query CkbTx($hash: String!) {
    ckbTransaction(txHash: $hash) {
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
`)

export default async function Page({ params: { tx } }: { params: { tx: string; lang: string } }) {
  const { rgbppTransaction } = await graphQLClient.request(rgbppTxQuery, { txidOrTxHash: tx })

  if (rgbppTransaction) {
    const { btcTransaction, ckbTransaction } = rgbppTransaction
    if (btcTransaction && !tx.startsWith('0x')) {
      return (
        <BTCTransactionPage
          btcTransaction={btcTransaction as BitcoinTransaction}
          ckbTransaction={ckbTransaction as CkbTransaction}
          leapDirection={rgbppTransaction?.leapDirection}
        />
      )
    }

    if (ckbTransaction && tx.startsWith('0x')) {
      return (
        <CKBTransactionPage
          ckbTransaction={ckbTransaction as CkbTransaction}
          btcTransaction={btcTransaction as BitcoinTransaction}
          leapDirection={rgbppTransaction?.leapDirection}
        />
      )
    }
  }

  const btcTxRes = await graphQLClient.request(btcTxQuery, { txid: tx })

  if (btcTxRes.btcTransaction) {
    return <BTCTransactionPage btcTransaction={btcTxRes.btcTransaction as BitcoinTransaction} />
  }

  const ckbTxRes = await graphQLClient.request(ckbTxQuery, { hash: tx })
  if (ckbTxRes.ckbTransaction) {
    return <CKBTransactionPage ckbTransaction={ckbTxRes.ckbTransaction as CkbTransaction} />
  }

  notFound()
}
