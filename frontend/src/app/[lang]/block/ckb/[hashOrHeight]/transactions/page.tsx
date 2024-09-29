import { notFound } from 'next/navigation'
import { VStack } from 'styled-system/jsx'

import { CkbTransactionCardWithQueryInBlock } from '@/components/ckb/ckb-transaction-card-with-query-in-block'
import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query CkbBlockTransactions($hashOrHeight: String!) {
    ckbBlock(heightOrHash: $hashOrHeight) {
      timestamp
      transactions {
        hash
      }
    }
  }
`)

export default async function Page({ params: { hashOrHeight } }: { params: { hashOrHeight: string; lang: string } }) {
  const data = await graphQLClient.request(query, { hashOrHeight })
  if (!data?.ckbBlock) notFound()
  return (
    <VStack w="100%" gap="30px">
      {data.ckbBlock.transactions?.map((tx) => {
        return <CkbTransactionCardWithQueryInBlock key={tx.hash} hash={tx.hash} timestamp={data.ckbBlock?.timestamp} />
      })}
    </VStack>
  )
}
