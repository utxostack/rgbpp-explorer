import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { Box, Flex, Grid, styled } from 'styled-system/jsx'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import BtcIcon from '@/assets/chains/btc.svg'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Text } from '@/components/ui'
import { graphql } from '@/gql'
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
  children,
  params: { typeHash, lang },
}: PropsWithChildren<{ params: { typeHash: string; lang: string } }>) {
  const i18n = getI18nInstance(lang)
  const response = await graphQLClient.request(query, { typeHash })
  if (!response.rgbppCoin) notFound()
  return (
    <>
      <Grid
        gridTemplateColumns="56px 1fr"
        columnGap="16px"
        rowGap={{ base: '16px', md: 0 }}
        w="100%"
        maxW="content"
        py="20px"
        px={{ base: '20px', xl: '30px' }}
        bg="bg.card"
        rounded="8px"
        alignItems="center"
      >
        <Box w="56px" h="56px" gridRow={{ base: '1/2', md: '1/3' }}>
          {response.rgbppCoin.icon ? (
            <styled.img w="100%" h="100%" src={response.rgbppCoin.icon} rounded="100%" />
          ) : (
            <BtcIcon w="100%" h="100%" />
          )}
        </Box>
        <Flex gap="12px" flexDirection={{ base: 'column', md: 'row' }}>
          <Text fontSize="20px" lineHeight="24px">
            {response.rgbppCoin.symbol}
          </Text>
          <Text as="span" fontSize="14px" color="text.third" lineHeight="18px">
            {response.rgbppCoin.name}
          </Text>
        </Flex>
        <Box gridColumn={{ base: '1/3', md: '2/3' }}>
          <Copier value={typeHash}>
            <Text fontSize="14px" color="text.secondary" lineHeight="24px" wordBreak="break-all" textAlign="left">
              {typeHash}
            </Text>
          </Copier>
        </Box>
      </Grid>
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
