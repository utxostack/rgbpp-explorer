import { t } from '@lingui/macro'
import { VStack } from 'styled-system/jsx'

import { LinkTabs } from '@/components/link-tabs'
import { withI18n } from '@/lib/with-i18n'

export default withI18n(function Layout({ children }, { i18n }) {
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
})
