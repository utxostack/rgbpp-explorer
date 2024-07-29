import { t } from '@lingui/macro'
import { HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import LinkOutlineIcon from '@/assets/link-outline.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { LayerType } from '@/components/layer-type'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { resolveCellDiff } from '@/lib/resolve-cell-diff'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { resolveRGBppTxHash } from '@/lib/resolve-rgbpp-tx-hash'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export default async function Page({ params: { typeHash } }: { params: { typeHash: string } }) {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()
  const pageSize = 10
  const response = await explorerGraphql.getRGBppCoinTransactions(typeHash, { page, pageSize })

  return (
    <VStack w="100%" bg="bg.card" maxW="content" rounded="8px" pt="30px">
      <Table.Root>
        <Table.Head>
          <Table.Row>
            <Table.Header>{t(i18n)`Tx hash`}</Table.Header>
            <Table.Header>{t(i18n)`Type`}</Table.Header>
            <Table.Header>{t(i18n)`Amount`}</Table.Header>
            <Table.Header>{t(i18n)`Time`}</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {response.rgbppCoin.transactions.map((tx) => {
            const txHash = resolveRGBppTxHash(tx)
            const cellDiff = resolveCellDiff(tx.ckbTransaction)
            return (
              <Table.Row key={tx.ckbTxHash}>
                <Table.Cell>
                  <Link href={`/transaction/${txHash}`} display="flex" alignItems="center" gap={3} color="text.link">
                    <LinkOutlineIcon w="36px" h="36px" />
                    {truncateMiddle(txHash, 10, 8)}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <LayerType type={resolveLayerTypeFromRGBppTransaction(tx)} />
                </Table.Cell>
                <Table.Cell>
                  <b>{formatNumber(cellDiff.value)}</b> {cellDiff.symbol}
                </Table.Cell>
                <Table.Cell w="165px">
                  <AgoTimeFormatter time={tx.timestamp} tooltip />
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>

      <HStack ml="auto" gap="16px" mt="auto" p="30px">
        <Text fontSize="14px">{t(i18n)`Total ${100} Items`}</Text>
        <PaginationSearchParams count={100} pageSize={pageSize} />
      </HStack>
    </VStack>
  )
}
