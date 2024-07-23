import { t } from '@lingui/macro'
import { PropsWithChildren } from 'react'
import { HStack, VStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import BtcIcon from '@/assets/chains/btc.svg'
import { LinkTabs } from '@/components/link-tabs'
import { Text } from '@/components/ui'

export default function AssetDetail({
  params: { codeHash },
  children,
}: { params: { codeHash: string } } & PropsWithChildren) {
  const i18n = getI18nFromHeaders()
  return (
    <>
      <HStack gap="16px" w="100%" maxW="content" py="20px" px="30px" bg="bg.card" rounded="8px">
        <BtcIcon w="56px" h="56px" />
        <VStack alignItems="start">
          <HStack>
            <Text fontSize="20px">Seal</Text>
          </HStack>
          <Text fontSize="14px" color="text.secondary">
            {codeHash}
          </Text>
        </VStack>
      </HStack>
      <LinkTabs
        links={[
          {
            href: `/assets/coins/${codeHash}/holders`,
            label: t(i18n)`Holders`,
          },
          {
            href: `/assets/coins/${codeHash}/transactions`,
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
