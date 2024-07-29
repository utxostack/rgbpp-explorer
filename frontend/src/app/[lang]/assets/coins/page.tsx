import { t } from '@lingui/macro'
import dayjs from 'dayjs'
import { HStack, styled, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import BtcIcon from '@/assets/chains/btc.svg'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { TIME_TEMPLATE } from '@/constants'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'
import { formatNumber } from '@/lib/string/format-number'

export default async function Page() {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()

  const pageSize = 10
  const response = await explorerGraphql.getRGBppCoins({ page, pageSize })

  return (
    <VStack w="100%" bg="bg.card" maxW="content" rounded="8px" pt="30px" flex={1}>
      <Table.Root>
        <Table.Head>
          <Table.Row>
            <Table.Header>{t(i18n)`Coin`}</Table.Header>
            <Table.Header>{t(i18n)`L1 and L2 Holders`}</Table.Header>
            <Table.Header>{t(i18n)`Txns(24H)`}</Table.Header>
            <Table.Header>{t(i18n)`Supply`}</Table.Header>
            <Table.Header>{t(i18n)`Deploy Time`}</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {response.rgbppCoins.coins.map((coin) => {
            return (
              <Table.Row key={coin.typeHash}>
                <Table.Cell>
                  <Link
                    href={`/assets/coins/${coin.typeHash}`}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    color="text.link"
                  >
                    {coin.icon ? <styled.img w="32px" h="32px" src={coin.icon} /> : <BtcIcon w="32px" h="32px" />}
                    <Text>{coin.symbol}</Text>
                  </Link>
                </Table.Cell>
                <Table.Cell>{formatNumber(coin.holdersCount)}</Table.Cell>
                <Table.Cell>{formatNumber(coin.h24CkbTransactionsCount)}</Table.Cell>
                <Table.Cell>{formatNumber(coin.totalAmount, coin.decimal)}</Table.Cell>
                <Table.Cell w="240px">
                  {coin.deployedAt ? dayjs(coin.deployedAt).format(TIME_TEMPLATE) : '-'}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      <HStack ml="auto" gap="16px" mt="auto" p="30px">
        <Text fontSize="14px">{t(i18n)`Total ${response.rgbppCoins.total} Items`}</Text>
        <PaginationSearchParams count={response.rgbppCoins.total} pageSize={pageSize} />
      </HStack>
    </VStack>
  )
}
