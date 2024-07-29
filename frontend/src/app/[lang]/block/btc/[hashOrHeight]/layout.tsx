import { t } from '@lingui/macro'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import BlockIcon from '@/assets/block.svg'
import { BtcBlockOverflow } from '@/components/btc/btc-block-overflow'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Heading, Text } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default async function Layout({
  params: { hashOrHeight },
  children,
}: {
  params: { hashOrHeight: string }
  children: ReactNode
}) {
  const i18n = getI18nFromHeaders()
  const data = await explorerGraphql.getBtcBlock(hashOrHeight)

  if (!data?.btcBlock) {
    return redirect('/')
  }

  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <HStack gap="16px">
          <BlockIcon w="56px" h="56px" />
          <VStack gap="8px" alignItems="start">
            <Heading fontSize="20px" fontWeight="semibold">
              {t(i18n)`Block ${data.btcBlock.height}`}
            </Heading>
            <Copier value={data.btcBlock.id}>{data.btcBlock.id}</Copier>
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
          6930{' '}
          <Text as="span" fontSize="14px" fontWeight="medium">
            {t(i18n)`confirmations`}
          </Text>
        </Box>
      </HStack>
      <BtcBlockOverflow block={data.btcBlock} />
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
