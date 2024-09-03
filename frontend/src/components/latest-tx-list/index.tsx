'use client'

import { useQuery } from '@tanstack/react-query'
import { Center } from 'styled-system/jsx'

import { FailedFallback } from '@/components/failed-fallback'
import { LatestTxnListUI } from '@/components/latest-tx-list/ui'
import { Loading } from '@/components/loading'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { RgbppTransaction } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query RgbppLatestTransactions($limit: Int!) {
    rgbppLatestTransactions(limit: $limit) {
      txs {
        ckbTxHash
        btcTxid
        leapDirection
        blockNumber
        timestamp
        ckbTransaction {
          outputs {
            txHash
            index
            capacity
            cellType
            lock {
              codeHash
              hashType
              args
            }
            xudtInfo {
              symbol
              amount
              decimal
            }
            status {
              consumed
              txHash
              index
            }
          }
        }
      }
      total
      pageSize
    }
  }
`)

export function LastRgbppTxnsTable() {
  const { isLoading, data, error } = useQuery({
    queryKey: [QueryKey.LastRgbppTxns],
    async queryFn() {
      return graphQLClient.request(query, {
        limit: 10,
      })
    },
    refetchInterval: 10000,
  })

  if (isLoading) {
    return (
      <Center h="823px">
        <Loading />
      </Center>
    )
  }

  if (error || !data) {
    return (
      <Center h="823px">
        <FailedFallback />
      </Center>
    )
  }

  return <LatestTxnListUI txs={data.rgbppLatestTransactions.txs as RgbppTransaction[]} />
}
