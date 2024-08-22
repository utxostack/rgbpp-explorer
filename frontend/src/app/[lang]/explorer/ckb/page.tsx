import { t } from '@lingui/macro'
import { Box, Grid } from 'styled-system/jsx'

import { Info } from '@/app/[lang]/explorer/ckb/info'
import { ExplorerTxList } from '@/components/explorer-tx-list'
import { Heading } from '@/components/ui'
import { graphql } from '@/gql'
import { RgbppTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

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
    <Grid gridTemplateColumns="repeat(2, 1fr)" w="100%" maxW="content" p={{ base: '20px', xl: '30px' }} gap="30px">
      <Info />
      <Box bg="bg.card" rounded="8px" whiteSpace="nowrap" pb="12px" gridColumn="1/3">
        <Heading fontSize="20px" fontWeight="semibold" p="30px">{t(i18n)`Latest L2 RGB++ transaction`}</Heading>
        <ExplorerTxList<RgbppTransaction>
          txs={rgbppLatestL2Transactions.txs as RgbppTransaction[]}
          txid={(tx) => tx.ckbTxHash ?? ''}
        />
      </Box>
    </Grid>
  )
}
