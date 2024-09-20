import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { VStack } from 'styled-system/jsx'

import { BlockHeader } from '@/components/block-header'
import { BtcBlockOverview } from '@/components/btc/btc-block-overview'
import { LinkTabs } from '@/components/link-tabs'
import { graphql } from '@/gql'
import { BitcoinBlock } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

export const dynamic = 'force-static'
export const revalidate = 10

const query = graphql(`
  query BtcBlock($hashOrHeight: String!) {
    btcBlock(hashOrHeight: $hashOrHeight) {
      id
      height
      version
      timestamp
      transactionsCount
      confirmations
      size
      weight
      bits
      difficulty
      totalFee
      miner {
        address
        satoshi
        pendingSatoshi
        transactionsCount
      }
      feeRateRange {
        min
        max
      }
    }
  }
`)

export default async function Layout({
  params: { hashOrHeight },
  children,
}: {
  params: { hashOrHeight: string }
  children: ReactNode
}) {
  const i18n = getI18nFromHeaders()
  const data = await graphQLClient.request(query, { hashOrHeight })

  if (!data?.btcBlock) notFound()

  return (
    <VStack w="100%" maxW="content" p={{ base: '20px', lg: '30px' }} gap={{ base: '20px', lg: '30px' }}>
      <BlockHeader id={data.btcBlock.id} height={data.btcBlock.height} confirmations={data.btcBlock.confirmations} />
      <BtcBlockOverview block={data.btcBlock as BitcoinBlock} />
      <LinkTabs
        w="100%"
        links={[
          {
            href: `/block/btc/${hashOrHeight}/transactions`,
            label: t(i18n)`Transactions`,
          },
        ]}
      />
      {children}
    </VStack>
  )
}
