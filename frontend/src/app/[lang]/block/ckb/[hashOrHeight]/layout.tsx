import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { Box, HStack, VStack } from 'styled-system/jsx'

import BlockIcon from '@/assets/block.svg'
import { CkbBlockOverview } from '@/components/ckb/ckb-block-overview'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Heading, Text } from '@/components/ui'
import { graphql } from '@/gql'
import { CkbBlock } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { formatNumber } from '@/lib/string/format-number'

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
  params: { hashOrHeight },
  children,
}: {
  params: { hashOrHeight: string }
  children: ReactNode
}) {
  const i18n = getI18nFromHeaders()
  const data = await graphQLClient.request(query, { hashOrHeight })

  if (!data?.ckbBlock) notFound()

  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <HStack gap="16px">
          <BlockIcon w="56px" h="56px" />
          <VStack gap="8px" alignItems="start">
            <Heading fontSize="20px" fontWeight="semibold">
              {t(i18n)`Block ${data.ckbBlock.number}`}
            </Heading>
            <Copier value={data.ckbBlock.hash}>{data.ckbBlock.hash}</Copier>
          </VStack>
        </HStack>
        <Box
          color="brand"
          fontWeight="semibold"
          fontSize="20px"
          lineHeight="24px"
          py="4px"
          px="12px"
          rounded="4px"
          bg="brand.a10"
          border="1px solid currentColor"
          ml="auto"
        >
          {formatNumber(data.ckbBlock?.confirmations ?? undefined)}
          <Text as="span" fontSize="14px" fontWeight="medium" ml="4px">
            {t(i18n)`Confirmations`}
          </Text>
        </Box>
      </HStack>
      <CkbBlockOverview block={data.ckbBlock as CkbBlock} />
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
