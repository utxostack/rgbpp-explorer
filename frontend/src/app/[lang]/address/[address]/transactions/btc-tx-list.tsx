'use client'

import { Trans } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { Center } from 'styled-system/jsx'

import { BtcTransactionCardWithQueryInAddress } from '@/components/btc/btc-transaction-card-with-query-in-address'
import { InfiniteListBottom } from '@/components/infinite-list-bottom'
import { Loading } from '@/components/loading'
import { NoData } from '@/components/no-data'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'

const btcAddressTxsQuery = graphql(`
  query BtcTransactionByAddress($address: String!, $afterTxid: String) {
    btcAddress(address: $address) {
      transactions(afterTxid: $afterTxid) {
        txid
      }
    }
  }
`)

export function BtcTxList({ address }: { address: string }) {
  const { data, isLoading, ...query } = useInfiniteQuery({
    queryKey: [QueryKey.BtcTransactionCardInAddressList, address],
    async queryFn({ pageParam }) {
      const { btcAddress } = await graphQLClient.request(btcAddressTxsQuery, {
        address,
        afterTxid: pageParam ? pageParam : undefined,
      })
      return btcAddress
    },
    select(data) {
      return compact(data.pages.flatMap((page) => page?.transactions))
    },
    getNextPageParam(lastPage) {
      if (!lastPage?.transactions?.length) return
      return lastPage?.transactions?.[lastPage?.transactions?.length - 1].txid
    },
    initialData: undefined,
    initialPageParam: '',
  })

  if (isLoading) {
    return <Loading my="80px" />
  }

  if (!query.hasNextPage && !data?.length) {
    return (
      <Center w="100%" bg="bg.card" pt="80px" pb="120px" rounded="8px">
        <NoData>
          <Trans>No Transaction</Trans>
        </NoData>
      </Center>
    )
  }

  return (
    <>
      {data?.map(({ txid }) => <BtcTransactionCardWithQueryInAddress address={address} txid={txid} key={txid} />)}
      <InfiniteListBottom {...query} />
    </>
  )
}
