import { t } from '@lingui/macro'
import { Box, Grid } from 'styled-system/jsx'

import { Info } from '@/app/[lang]/explorer/ckb/info'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { LayerType } from '@/components/layer-type'
import { Heading, Table } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { CkbTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export const revalidate = 5

const query = graphql(`
  query RgbppL2LatestTransactions {
    ckbTransactions(types: [XUDT, SUDT, DOB, MNFT], limit: 10) {
      isCellbase
      blockNumber
      hash
      fee
      feeRate
      size
      block {
        timestamp
      }
      outputs {
        txHash
        index
        capacity
        cellType
        xudtInfo {
          symbol
          amount
          decimal
          typeHash
        }
      }
      inputs {
        txHash
        index
        capacity
        cellType
        xudtInfo {
          symbol
          amount
          decimal
          typeHash
        }
      }
    }
  }
`)

export default async function Page() {
  const i18n = getI18nFromHeaders()
  const { ckbTransactions } = await graphQLClient.request(query)

  return (
    <Grid gridTemplateColumns="repeat(2, 1fr)" w="100%" maxW="content" p="30px" gap="30px">
      <Info />
      <Box bg="bg.card" rounded="8px" whiteSpace="nowrap" pb="12px" gridColumn="1/3">
        <Heading fontSize="20px" fontWeight="semibold" p="30px">{t(i18n)`Latest L2 RGB++ transaction`}</Heading>
        <Table.Root>
          <Table.Body>
            {ckbTransactions.map((tx) => {
              return (
                <Table.Row key={tx.hash} lineHeight="36px">
                  <Table.Cell>
                    <Link href={`/transaction/${tx.hash}`} display="flex" alignItems="center" gap={3} color="text.link">
                      {truncateMiddle(tx.hash ?? '', 10, 8)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <LayerType type="l2" />
                  </Table.Cell>
                  <Table.Cell w="165px">
                    <AgoTimeFormatter time={tx.block.timestamp} tooltip />
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Amount ckbTransaction={tx as CkbTransaction} />
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
