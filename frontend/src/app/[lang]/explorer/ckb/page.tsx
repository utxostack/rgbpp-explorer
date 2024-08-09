import { t } from '@lingui/macro'
import { Box, Grid } from 'styled-system/jsx'

import { Info } from '@/app/[lang]/explorer/ckb/info'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { LayerType } from '@/components/layer-type'
import { Heading, Table } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { CkbTransaction, RgbppTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export const revalidate = 5

const query = graphql(`
  query RgbppLatestL2Transactions($limit: Int!) {
    rgbppLatestL2Transactions(limit: $limit) {
      txs {
        ckbTxHash
        leapDirection
        timestamp
        ckbTransaction {
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
      }
      total
      pageSize
    }
  }
`)

export default async function Page() {
  const i18n = getI18nFromHeaders()
  const { rgbppLatestL2Transactions } = await graphQLClient.request(query, { limit: 10 })

  return (
    <Grid gridTemplateColumns="repeat(2, 1fr)" w="100%" maxW="content" p="30px" gap="30px">
      <Info />
      <Box bg="bg.card" rounded="8px" whiteSpace="nowrap" pb="12px" gridColumn="1/3">
        <Heading fontSize="20px" fontWeight="semibold" p="30px">{t(i18n)`Latest L2 RGB++ transaction`}</Heading>
        <Table.Root tableLayout="fixed">
          <Table.Body>
            {rgbppLatestL2Transactions.txs.map((tx) => {
              return (
                <Table.Row key={`${tx.ckbTxHash}`} lineHeight="36px">
                  <Table.Cell w="254px">
                    <Link
                      href={`/transaction/${tx.ckbTxHash}`}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      color="text.link"
                    >
                      {truncateMiddle(tx.ckbTxHash ?? '', 10, 8)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell w="160px">
                    <LayerType type={resolveLayerTypeFromRGBppTransaction(tx as RgbppTransaction)} />
                  </Table.Cell>
                  <Table.Cell w="160px">
                    <AgoTimeFormatter time={tx.timestamp} tooltip />
                  </Table.Cell>
                  <Table.Cell textAlign="right" w="160px">
                    <Amount ckbTransaction={tx.ckbTransaction as CkbTransaction} />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Grid>
  )
}
