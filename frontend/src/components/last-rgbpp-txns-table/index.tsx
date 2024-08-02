'use client'

import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Center } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import LinkOutlineIcon from '@/assets/link-outline.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { FailedFallback } from '@/components/failed-fallback'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { LayerType } from '@/components/layer-type'
import { Loading } from '@/components/loading'
import Link from '@/components/ui/link'
import { Table } from '@/components/ui/primitives'
import { QueryKey } from '@/constants/query-key'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { resolveRGBppTxHash } from '@/lib/resolve-rgbpp-tx-hash'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export function LastRgbppTxnsTable() {
  const { isLoading, data, error } = useQuery({
    queryKey: [QueryKey.LastRgbppTxns],
    async queryFn() {
      return explorerGraphql.getRGBppLatestTransactions()
    },
    refetchInterval: 10000,
  })

  if (error) {
    return (
      <Center h="823px">
        <FailedFallback />
      </Center>
    )
  }

  if (isLoading) {
    return (
      <Center h="823px">
        <Loading />
      </Center>
    )
  }

  return (
    <Table.Root>
      <Table.Head>
        <Table.Row>
          <Table.Header>
            <Trans>Tx hash</Trans>
          </Table.Header>
          <Table.Header>
            <Trans>Type</Trans>
          </Table.Header>
          <Table.Header>
            <Trans>Amount</Trans>
          </Table.Header>
          <Table.Header>
            <Trans>Time</Trans>
          </Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {data?.rgbppLatestTransactions.txs.map((tx) => {
          const txHash = resolveRGBppTxHash(tx)
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
                <Amount ckbTransaction={tx.ckbTransaction} />
              </Table.Cell>
              <Table.Cell w="165px">
                <AgoTimeFormatter time={tx.timestamp} tooltip />
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table.Root>
  )
}
