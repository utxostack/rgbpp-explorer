import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { VStack } from 'styled-system/jsx'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { BlockHeader } from '@/components/block-header'
import { CkbBlockOverview } from '@/components/ckb/ckb-block-overview'
import { LinkTabs } from '@/components/link-tabs'
import { graphql } from '@/gql'
import { CkbBlock } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'

export const dynamic = 'force-static'
export const revalidate = 10

const query = graphql(`
  query CkbBlock($hashOrHeight: String!) {
    ckbBlock(heightOrHash: $hashOrHeight) {
      version
      hash
      number
      timestamp
      transactionsCount
      totalFee
      miner {
        address
        shannon
        transactionsCount
      }
      reward
      size
      confirmations
    }
  }
`)

export default async function Layout({
  params: { hashOrHeight, lang },
  children,
}: PropsWithChildren<{
  params: { hashOrHeight: string; lang: string }
}>) {
  const data = await graphQLClient.request(query, { hashOrHeight })
  if (!data?.ckbBlock) notFound()
  const i18n = getI18nInstance(lang)

  return (
    <VStack w="100%" maxW="content" p={{ base: '20px', lg: '30px' }} gap={{ base: '20px', lg: '30px' }}>
      <BlockHeader
        i18n={i18n}
        id={data.ckbBlock.hash}
        height={data.ckbBlock.number}
        confirmations={data.ckbBlock.confirmations}
      />
      <CkbBlockOverview i18n={i18n} block={data.ckbBlock as CkbBlock} />
      <LinkTabs
        w="100%"
        links={[
          {
            href: `/block/ckb/${hashOrHeight}/transactions`,
            label: t(i18n)`Transactions`,
          },
        ]}
      />
      {children}
    </VStack>
  )
}
