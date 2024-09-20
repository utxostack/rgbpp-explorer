import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { VStack } from 'styled-system/jsx'

import { BlockHeader } from '@/components/block-header'
import { BtcBlockOverview } from '@/components/btc/btc-block-overview'
import { LinkTabs } from '@/components/link-tabs'
import { graphql } from '@/gql'
import { BitcoinBlock } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'
import { withI18n } from '@/lib/with-i18n'

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

export default withI18n<{ hashOrHeight: string }>(async function Layout(
  { params: { hashOrHeight }, children },
  { i18n },
) {
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
})
