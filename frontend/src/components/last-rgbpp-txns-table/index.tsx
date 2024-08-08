'use client'

import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Center } from 'styled-system/jsx'

import LinkOutlineIcon from '@/assets/link-outline.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { FailedFallback } from '@/components/failed-fallback'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { LayerType } from '@/components/layer-type'
import { Loading } from '@/components/loading'
import Link from '@/components/ui/link'
import { Table } from '@/components/ui/primitives'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { CkbTransaction, RgbppTransaction } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { resolveRGBppTxHash } from '@/lib/resolve-rgbpp-tx-hash'
import { truncateMiddle } from '@/lib/string/truncate-middle'

const query = graphql(`
  query RgbppLatestTransactions($page: Int!, $pageSize: Int!) {
    rgbppLatestTransactions(page: $page, pageSize: $pageSize) {
      txs {
        ckbTxHash
        btcTxid
        leapDirection
        blockNumber
        timestamp
        ckbTransaction {
          blockNumber
          hash
          fee
          size
          inputs {
            status {
              consumed
              txHash
              index
            }
            txHash
            index
            capacity
            lock {
              codeHash
              hashType
              args
            }
            cellType
            xudtInfo {
              symbol
              amount
              decimal
            }
          }
          outputs {
            txHash
            index
            capacity
            cellType
            lock {
              codeHash
              hashType
              args
            }
            xudtInfo {
              symbol
              amount
              decimal
            }
            status {
              consumed
              txHash
              index
            }
          }
        }
        btcTransaction {
          blockHeight
          blockHash
          txid
          version
          size
          locktime
          weight
          fee
          confirmed
        }
      }
      total
      pageSize
    }
  }
`)

export function LastRgbppTxnsTable() {
  const { isLoading, data, error } = useQuery({
    queryKey: [QueryKey.LastRgbppTxns],
    async queryFn() {
      return graphQLClient.request(query, {
        page: 1,
        pageSize: 10,
      })
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
    <Table.Root tableLayout="fixed">
      <Table.Head>
        <Table.Row>
          <Table.Header w="254px">
            <Trans>Tx hash</Trans>
          </Table.Header>
          <Table.Header w="160px">
            <Trans>Type</Trans>
          </Table.Header>
          <Table.Header w="200px">
            <Trans>Amount</Trans>
          </Table.Header>
          <Table.Header w="140px">
            <Trans>Time</Trans>
          </Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {data?.rgbppLatestTransactions.txs.map((tx) => {
          const txHash = resolveRGBppTxHash(tx as RgbppTransaction)
          return (
            <Table.Row key={tx.ckbTxHash}>
              <Table.Cell>
                <Link href={`/transaction/${txHash}`} display="flex" alignItems="center" gap={3} color="text.link">
                  <LinkOutlineIcon w="36px" h="36px" />
                  {truncateMiddle(txHash, 10, 8)}
                </Link>
              </Table.Cell>
              <Table.Cell>
                <LayerType type={resolveLayerTypeFromRGBppTransaction(tx as RgbppTransaction)} />
              </Table.Cell>
              <Table.Cell>
                <Amount ckbTransaction={tx.ckbTransaction as CkbTransaction} />
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
