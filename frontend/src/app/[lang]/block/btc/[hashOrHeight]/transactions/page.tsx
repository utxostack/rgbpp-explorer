import { notFound } from 'next/navigation'
import { VStack } from 'styled-system/jsx'

import { BtcTransactionCardWithQueryInBlock } from '@/components/btc/btc-transaction-card-with-query-in-block'
import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'

export const dynamic = 'force-static'
export const revalidate = 10

const query = graphql(`
  query BtcBlockTransaction($hashOrHeight: String!) {
    btcBlock(hashOrHeight: $hashOrHeight) {
      timestamp
      transactions {
        txid
      }
    }
  }
`)

export default async function Page({
  params: { hashOrHeight, lang },
}: {
  params: { hashOrHeight: string; lang: string }
}) {
  const data = await graphQLClient.request(query, { hashOrHeight })
  if (!data?.btcBlock) notFound()
  return (
    <VStack w="100%" gap="30px">
      {data.btcBlock?.transactions?.map((tx) => {
        return <BtcTransactionCardWithQueryInBlock txid={tx.txid} key={tx.txid} />
      })}
    </VStack>
  )
}
