'use client'

import { useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { Skeleton } from '@/components/ui/primitives/skeleton'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'

const btcTransactionQuery = graphql(`
  query BtcTransactionByTxId($txid: String!) {
    btcTransaction(txid: $txid) {
      txid
      fee
      feeRate
      confirmations
      transactionTime
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
  }
`)

const btcRgbppTransactionQuery = graphql(`
  query BtcRgbppTransactionByTxId($txid: String!) {
    btcTransaction(txid: $txid) {
      rgbppTransaction {
        ckbTransaction {
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
        }
      }
    }
  }
`)

interface Props {
  txid: string
  ckbTxHash?: string
  address: string
}

export function BtcTransactionCardWithQueryInAddress({ txid, address }: Props) {
  const [ref, inView] = useInView({
    threshold: 0,
  })
  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKey.BtcTransactionCardWithQueryInAddress, txid],
    async queryFn() {
      const { btcTransaction } = await graphQLClient.request(btcTransactionQuery, {
        txid,
      })
      return btcTransaction
    },
    enabled: inView,
  })

  const { data: ckbTx } = useQuery({
    queryKey: [QueryKey.BtcTransactionCardWithQueryInAddress, txid, 'rgbpp'],
    async queryFn() {
      const { btcTransaction } = await graphQLClient.request(btcRgbppTransactionQuery, {
        txid,
      })
      return btcTransaction?.rgbppTransaction?.ckbTransaction
    },
  })

  if (error) return null

  return (
    <Skeleton ref={ref} isLoaded={!isLoading} minH={!data ? '480px' : 'auto'} w="100%">
      {data ? (
        <BtcTransactionCardInAddress
          tx={data as BitcoinTransaction}
          address={address}
          ckbCell={ckbTx as Pick<CkbTransaction, 'inputs' | 'outputs'>}
        />
      ) : null}
    </Skeleton>
  )
}
