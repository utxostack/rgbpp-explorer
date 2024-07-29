import { t } from '@lingui/macro'
import { redirect } from 'next/navigation'
import type { PropsWithChildren, ReactNode } from 'react'
import { HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { BtcAddressOverflow } from '@/components/btc/btc-address-overflow'
import { CkbAddressOverflow } from '@/components/ckb/ckb-address-overflow'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Heading } from '@/components/ui'
import { isValidBTCAddress } from '@/lib/btc/is-valid-btc-address'
import { isValidCkbAddress } from '@/lib/ckb/is-valid-ckb-address'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default async function Layout({
  children,
  params: { address },
}: PropsWithChildren & { params: { address: string } }) {
  const i18n = getI18nFromHeaders()
  const isBtcAddress = isValidBTCAddress(address)
  const isCkbAddress = isValidCkbAddress(address)

  if (!isBtcAddress && !isCkbAddress) return redirect('/')

  let overflow: ReactNode = null
  if (isBtcAddress) {
    const data = await explorerGraphql.getBtcAddress(address).catch(() => null)
    if (data?.btcAddress) {
      overflow = <BtcAddressOverflow btcAddress={data?.btcAddress} />
    }
  } else if (isCkbAddress) {
    const data = await explorerGraphql.getCkbAddress(address).catch(() => null)
    if (data?.ckbAddress) {
      overflow = <CkbAddressOverflow ckbAddress={data?.ckbAddress} />
    }
  }

  if (!overflow) return redirect('/')

  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Address`}
        </Heading>
        <Copier value={address}>{address}</Copier>
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
