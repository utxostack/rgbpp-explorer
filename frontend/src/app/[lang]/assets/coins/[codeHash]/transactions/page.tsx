import { t } from '@lingui/macro'
import { HStack, VStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import { LastRgbppTxnsTable } from '@/components/last-rgbpp-txns-table'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Text } from '@/components/ui'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'

export default function Page() {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()

  return (
    <VStack w="100%" bg="bg.card" maxW="content" rounded="8px" pt="30px">
      <LastRgbppTxnsTable />
      <HStack ml="auto" gap="16px" mt="auto" p="30px">
        <Text fontSize="14px">{t(i18n)`Total ${100} Items`}</Text>
        <PaginationSearchParams count={100} pageSize={10} />
      </HStack>
    </VStack>
  )
}
