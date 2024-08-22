import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import type { PropsWithChildren, ReactNode } from 'react'
import { HStack, VStack } from 'styled-system/jsx'

import { BtcAddressOverview } from '@/components/btc/btc-address-overview'
import { BtcAddressType } from '@/components/btc/btc-address-type'
import { CkbAddressOverview } from '@/components/ckb/ckb-address-overview'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Heading, Text } from '@/components/ui'
import { graphql } from '@/gql'
import { isValidBTCAddress } from '@/lib/btc/is-valid-btc-address'
import { isValidCkbAddress } from '@/lib/ckb/is-valid-ckb-address'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

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
  params: { address },
}: PropsWithChildren & { params: { address: string } }) {
  const i18n = getI18nFromHeaders()
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
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Address`}
        </Heading>
        <Copier value={address}>
          <HStack maxW="calc(1160px - 100px - 24px)" truncate>
            <Text as="span" wordBreak="break-all" whiteSpace="wrap" textAlign="left">
              {address}
            </Text>
            <BtcAddressType address={address} />
          </HStack>
        </Copier>
      </HStack>
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
