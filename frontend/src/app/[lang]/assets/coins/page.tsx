import { t } from '@lingui/macro'
import dayjs from 'dayjs'
import { HStack, VStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import BtcIcon from '@/assets/chains/btc.svg'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { TIME_TEMPLATE } from '@/constants'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'

export default function Page() {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()

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
          <Table.Row>
            <Table.Cell>
              <Link href="/assets/coins/123" display="flex" alignItems="center" gap={3} color="text.link">
                <BtcIcon w="32px" h="32px" />
                <Text>Seal</Text>
              </Link>
            </Table.Cell>
            <Table.Cell>{(100000).toLocaleString()}</Table.Cell>
            <Table.Cell>{(100000).toLocaleString()}</Table.Cell>
            <Table.Cell>{(100000).toLocaleString()}</Table.Cell>
            <Table.Cell w="240px">{dayjs().format(TIME_TEMPLATE)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <HStack ml="auto" gap="16px" mt="auto" p="30px">
        <Text fontSize="14px">{t(i18n)`Total ${100} Items`}</Text>
        <PaginationSearchParams count={100} pageSize={10} />
      </HStack>
    </VStack>
  )
}
