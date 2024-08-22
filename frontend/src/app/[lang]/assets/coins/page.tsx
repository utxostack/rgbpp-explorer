import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { CoinList } from '@/components/coin-list'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Text } from '@/components/ui'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'

const query = graphql(`
  query RgbppCoins($page: Int!, $pageSize: Int!) {
    rgbppCoins(page: $page, pageSize: $pageSize) {
      total
      pageSize
      coins {
        icon
        name
        symbol
        holdersCount
        h24CkbTransactionsCount
        totalAmount
        deployedAt
        decimal
        typeHash
      }
    }
  }
`)

export default async function Page() {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()

  const pageSize = 10
  const response = await graphQLClient.request(query, { page, pageSize })

  return (
    <VStack w="100%" maxW="content" flex={1} gap="32px">
      <Box bg="bg.card" w="100%" rounded="8px" pt={{ base: '10px', lg: '30px' }} pb="10px">
        <CoinList coins={response.rgbppCoins.coins} />
      </Box>
      <HStack gap="16px" mt="auto">
        <IfBreakpoint breakpoint="md">
          <Text fontSize="14px">{t(i18n)`Total ${response.rgbppCoins.total} Items`}</Text>
        </IfBreakpoint>
        <PaginationSearchParams count={response.rgbppCoins.total} pageSize={pageSize} />
      </HStack>
    </VStack>
  )
}
