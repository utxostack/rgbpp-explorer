import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import type { PropsWithChildren } from 'react'
import { HStack, VStack } from 'styled-system/jsx'

import { Overflow } from '@/app/[lang]/address/[address]/overflow'
import { Copier } from '@/components/copier'
import { LinkTabs } from '@/components/link-tabs'
import { Heading } from '@/components/ui'

export default function Layout({ children, params: { address } }: PropsWithChildren & { params: { address: string } }) {
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Address`}
        </Heading>
        <Copier value={address}>{address}</Copier>
      </HStack>
      <Overflow />
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
