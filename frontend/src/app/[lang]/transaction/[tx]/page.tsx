import { notFound } from 'next/navigation'

import { BTCTransactionPage } from '@/app/[lang]/transaction/[tx]/btc'
import { CKBTransactionPage } from '@/app/[lang]/transaction/[tx]/ckb'
import { graphql } from '@/gql'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
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
        block {
          timestamp
        }
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
    btcTransaction(txid: $txidOrTxHash) {
      blockHeight
      blockHash
      txid
      version
      size
      block {
        timestamp
      }
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
    ckbTransaction(txHash: $txidOrTxHash) {
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

export default async function Page({ params: { tx } }: { params: { tx: string } }) {
  const { rgbppTransaction, ...result } = await graphQLClient.request(query, { txidOrTxHash: tx })
  const btcTransaction = rgbppTransaction?.btcTransaction || result.btcTransaction
  const ckbTransaction = rgbppTransaction?.ckbTransaction || result.ckbTransaction

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

  if (btcTransaction) {
    return (
      <BTCTransactionPage
        btcTransaction={btcTransaction as BitcoinTransaction}
        ckbTransaction={ckbTransaction as CkbTransaction}
        leapDirection={rgbppTransaction?.leapDirection}
      />
    )
  }

  if (ckbTransaction) {
    return (
      <CKBTransactionPage
        ckbTransaction={ckbTransaction as CkbTransaction}
        btcTransaction={btcTransaction}
        leapDirection={rgbppTransaction?.leapDirection}
      />
    )
  }
  notFound()
}
