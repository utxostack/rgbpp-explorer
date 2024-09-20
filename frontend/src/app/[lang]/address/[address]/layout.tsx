import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import type { PropsWithChildren, ReactNode } from 'react'
import { Flex, HStack, VStack } from 'styled-system/jsx'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { BtcAddressOverview } from '@/components/btc/btc-address-overview'
import { BtcAddressType } from '@/components/btc/btc-address-type'
import { CkbAddressOverview } from '@/components/ckb/ckb-address-overview'
import { Copier } from '@/components/copier'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { LinkTabs } from '@/components/link-tabs'
import { Heading, Text } from '@/components/ui'
import { graphql } from '@/gql'
import { isValidBTCAddress } from '@/lib/btc/is-valid-btc-address'
import { isValidCkbAddress } from '@/lib/ckb/is-valid-ckb-address'
import { graphQLClient } from '@/lib/graphql'

export const dynamic = 'force-static'
export const revalidate = 10

const btcAddressQuery = graphql(`
  query BtcAddressBase($address: String!) {
    btcAddress(address: $address) {
      address
      satoshi
      pendingSatoshi
      transactionsCount
    }
  }
`)

const ckbAddressQuery = graphql(`
  query CkbAddressBase($address: String!) {
    ckbAddress(address: $address) {
      address
      shannon
      balance {
        total
        available
        occupied
      }
      transactionsCount
    }
  }
`)

export default async function Layout({
  children,
  params: { address, lang },
}: PropsWithChildren & { params: { address: string; lang: string } }) {
  const i18n = getI18nInstance(lang)
  const isBtcAddress = isValidBTCAddress(address)
  const isCkbAddress = isValidCkbAddress(address)

  if (!isBtcAddress && !isCkbAddress) notFound()

  let overflow: ReactNode = null
  if (isBtcAddress) {
    const data = await graphQLClient.request(btcAddressQuery, { address })
    if (data?.btcAddress) {
      overflow = <BtcAddressOverview btcAddress={data?.btcAddress} />
    }
  } else if (isCkbAddress) {
    const data = await graphQLClient.request(ckbAddressQuery, { address })
    if (data?.ckbAddress) {
      overflow = <CkbAddressOverview ckbAddress={data?.ckbAddress} />
    }
  }

  if (!overflow) notFound()

  return (
    <VStack w="100%" maxW="content" p={{ base: '20px', xl: '30px' }} gap={{ base: '20px', xl: '30px' }}>
      <Flex
        flexDirection={{ base: 'column', lg: 'row' }}
        w="100%"
        gap={{ base: '8px', lg: '24px' }}
        p="30px"
        bg="bg.card"
        rounded="8px"
      >
        <Heading display="flex" alignItems="center" gap="16px" fontSize="20px" lineHeight="24px" fontWeight="semibold">
          {t(i18n)`Address`}
          <IfBreakpoint breakpoint="lg" fallback={<BtcAddressType address={address} />} />
        </Heading>
        <Copier value={address}>
          <HStack maxW="calc(1160px - 100px - 24px)" truncate>
            <Text as="span" wordBreak="break-all" whiteSpace="wrap" textAlign="left">
              {address}
            </Text>
            <IfBreakpoint breakpoint="lg">
              <BtcAddressType address={address} />
            </IfBreakpoint>
          </HStack>
        </Copier>
      </Flex>
      {overflow}
      <LinkTabs
        w="100%"
        links={[
          {
            href: `/address/${address}/transactions`,
            label: t(i18n)`Transactions`,
          },
          {
            href: `/address/${address}/assets`,
            label: t(i18n)`RGB++ Assets`,
          },
        ]}
      />
      {children}
    </VStack>
  )
}
