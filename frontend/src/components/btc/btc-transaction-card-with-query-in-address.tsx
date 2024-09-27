'use client'

import { useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { Skeleton } from '@/components/ui/primitives/skeleton'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { BitcoinTransaction } from '@/gql/graphql'
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

  if (error) return null

  return (
    <Skeleton ref={ref} isLoaded={!isLoading} minH={!data ? '480px' : 'auto'} w="100%">
      {data ? <BtcTransactionCardInAddress tx={data as BitcoinTransaction} address={address} /> : null}
    </Skeleton>
  )
}
