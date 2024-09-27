'use client'

import { Trans } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { Center } from 'styled-system/jsx'

import { CkbTransactionCardWithQueryInAddress } from '@/components/ckb/ckb-transaction-card-with-query-in-address'
import { InfiniteListBottom } from '@/components/infinite-list-bottom'
import { Loading } from '@/components/loading'
import { NoData } from '@/components/no-data'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'

const ckbAddressTxsQuery = graphql(`
  query CkbTransactionByAddress($address: String!, $page: Int!, $pageSize: Int!) {
    ckbAddress(address: $address) {
      transactionsCount
      transactions(page: $page, pageSize: $pageSize) {
        hash
      }
    }
  }
`)

export function CKBTxList({ address }: { address: string }) {
  const { data, isLoading, ...query } = useInfiniteQuery({
    queryKey: [QueryKey.CkbTransactionCardInAddressList, address],
    async queryFn({ pageParam }) {
      const { ckbAddress } = await graphQLClient.request(ckbAddressTxsQuery, {
        address,
        page: pageParam,
        pageSize: 10,
      })
      return ckbAddress
    },
    select(data) {
      return compact(data.pages.flatMap((page) => page?.transactions))
    },
    getNextPageParam(lastPage, _, pageParam) {
      if (lastPage?.transactionsCount && pageParam * 10 >= lastPage?.transactionsCount) return
      return pageParam + 1
    },
    initialData: undefined,
    initialPageParam: 1,
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
      {data?.map(({ hash }) => <CkbTransactionCardWithQueryInAddress address={address} hash={hash} key={hash} />)}
      <InfiniteListBottom {...query} />
    </>
  )
}
