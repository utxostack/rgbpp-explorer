import { t } from '@lingui/macro'
import { PropsWithChildren } from 'react'
import { VStack } from 'styled-system/jsx'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { LinkTabs } from '@/components/link-tabs'

export default function Layout({
  params,
  children,
}: PropsWithChildren<{
  params: { lang: string }
}>) {
  const i18n = getI18nInstance(params.lang)
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
