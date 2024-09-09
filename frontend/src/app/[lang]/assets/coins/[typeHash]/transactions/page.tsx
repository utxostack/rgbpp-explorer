import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { IfBreakpoint } from '@/components/if-breakpoint'
import { LatestTxnListUI } from '@/components/latest-tx-list/ui'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Text } from '@/components/ui'
import { graphql } from '@/gql'
import { RgbppTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'
import { formatNumber } from '@/lib/string/format-number'

const query = graphql(`
  query RgbppCoinTransactionsByTypeHash($typeHash: String!, $page: Int!, $pageSize: Int!) {
    rgbppCoin(typeHash: $typeHash) {
      transactionsCount
      transactions(page: $page, pageSize: $pageSize) {
        ckbTxHash
        btcTxid
        leapDirection
        blockNumber
        timestamp
        ckbTransaction {
          inputs {
            txHash
            index
            capacity
            status {
              consumed
              txHash
              index
            }
            type {
              codeHash
              hashType
              args
            }
            lock {
              codeHash
              hashType
              args
            }
            xudtInfo {
              symbol
              amount
              decimal
              typeHash
            }
          }
          outputs {
            txHash
            index
            capacity
            status {
              consumed
              txHash
              index
            }
            type {
              codeHash
              hashType
              args
            }
            lock {
              codeHash
              hashType
              args
            }
            xudtInfo {
              symbol
              amount
              decimal
              typeHash
            }
          }
        }
      }
    }
  }
`)

export default async function Page({ params: { typeHash } }: { params: { typeHash: string } }) {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()
  const pageSize = 10
  const response = await graphQLClient.request(query, { typeHash, page, pageSize })
  if (!response.rgbppCoin) notFound()

  return (
    <VStack w="100%" maxW="content" gap="32px">
      <Box w="100%" bg="bg.card" rounded="8px" pt={{ base: '10px', md: '30px' }} pb="10px">
        <LatestTxnListUI txs={(response.rgbppCoin.transactions as RgbppTransaction[]) ?? []} />
      </Box>

      <HStack gap="16px" mt="auto" p="30px">
        <IfBreakpoint breakpoint="md">
          <Text fontSize="14px">{t(
            i18n,
          )`Total ${formatNumber(response.rgbppCoin.transactionsCount ?? undefined)} Items`}</Text>
        </IfBreakpoint>
        <PaginationSearchParams count={response.rgbppCoin.transactionsCount ?? 0} pageSize={pageSize} />
      </HStack>
    </VStack>
  )
}
