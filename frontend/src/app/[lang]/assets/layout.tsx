import { t } from '@lingui/macro'
import type { PropsWithChildren } from 'react'
import { VStack } from 'styled-system/jsx'

import { LinkTabs } from '@/components/link-tabs'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default function Layout({ children }: PropsWithChildren) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap="30px" w="100%" px={{ base: '20px', xl: '40px' }} pt="30px" pb="56px" flex={1}>
      <LinkTabs
        links={[
          {
            href: '/assets/coins',
            label: t(i18n)`Coins`,
          },
          {
            href: '/assets/dobs',
            label: t(i18n)`DOBs`,
          },
        ]}
        maxW="content"
        w="100%"
        justify="start"
      />
      {children}
    </VStack>
  )
}
