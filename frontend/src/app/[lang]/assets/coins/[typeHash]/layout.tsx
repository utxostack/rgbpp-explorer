import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { HStack, styled, VStack } from 'styled-system/jsx'

import BtcIcon from '@/assets/chains/btc.svg'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Text } from '@/components/ui'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query RgbppCoin($typeHash: String!) {
    rgbppCoin(typeHash: $typeHash) {
      name
      symbol
      icon
    }
  }
`)

export default async function AssetDetail({
  params: { typeHash },
  children,
}: { params: { typeHash: string } } & PropsWithChildren) {
  const i18n = getI18nFromHeaders()
  const response = await graphQLClient.request(query, { typeHash })
  if (!response.rgbppCoin) notFound()
  return (
    <>
      <HStack gap="16px" w="100%" maxW="content" py="20px" px="30px" bg="bg.card" rounded="8px">
        {response.rgbppCoin.icon ? (
          <styled.img w="56px" h="56px" src={response.rgbppCoin.icon} />
        ) : (
          <BtcIcon w="56px" h="56px" />
        )}

        <VStack alignItems="start">
          <HStack>
            <Text fontSize="20px">{response.rgbppCoin.symbol}</Text>
            <Text as="span" fontSize="14px" color="text.third">
              {response.rgbppCoin.name}
            </Text>
          </HStack>
          <Copier value={typeHash}>
            <Text fontSize="14px" color="text.secondary">
              {typeHash}
            </Text>
          </Copier>
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
