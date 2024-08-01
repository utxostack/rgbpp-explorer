import { t } from '@lingui/macro'
import { ReactNode } from 'react'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import BlockIcon from '@/assets/block.svg'
import { CkbBlockOverflow } from '@/components/ckb/ckb-block-overflow'
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
  const data = await explorerGraphql.getCkbBlock(hashOrHeight)

  if (!data?.ckbBlock) {
    throw new Error(t(i18n)`The block ${hashOrHeight} not found`)
  }

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
          {'- '}
          <Text as="span" fontSize="14px" fontWeight="medium">
            {t(i18n)`Confirmations`}
          </Text>
        </Box>
      </HStack>
      <CkbBlockOverflow block={data.ckbBlock} />
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
