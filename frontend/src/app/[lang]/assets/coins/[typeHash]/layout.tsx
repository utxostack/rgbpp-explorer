import { t } from '@lingui/macro'
import { PropsWithChildren } from 'react'
import { HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import BtcIcon from '@/assets/chains/btc.svg'
import { LinkTabs } from '@/components/link-tabs'
import { Text } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default async function AssetDetail({
  params: { typeHash },
  children,
}: { params: { typeHash: string } } & PropsWithChildren) {
  const i18n = getI18nFromHeaders()
  const response = await explorerGraphql.getRGBppCoin(typeHash)
  return (
    <>
      <HStack gap="16px" w="100%" maxW="content" py="20px" px="30px" bg="bg.card" rounded="8px">
        <BtcIcon w="56px" h="56px" />
        <VStack alignItems="start">
          <HStack>
            <Text fontSize="20px">{response.rgbppCoin.symbol}</Text>
            <Text as="span" fontSize="14px" color="text.third">
              {response.rgbppCoin.name}
            </Text>
          </HStack>
          <Text fontSize="14px" color="text.secondary">
            {typeHash}
          </Text>
        </VStack>
      </HStack>
      <LinkTabs
        links={[
          {
            href: `/assets/coins/${typeHash}/holders`,
            label: t(i18n)`Holders`,
          },
          {
            href: `/assets/coins/${typeHash}/transactions`,
            label: t(i18n)`Transactions`,
          },
        ]}
        maxW="content"
        w="100%"
        justify="start"
      />
      {children}
    </>
  )
}
