import { t } from '@lingui/macro'
import { Box, Grid } from 'styled-system/jsx'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { Info } from '@/app/[lang]/explorer/btc/info'
import { ExplorerTxList } from '@/components/explorer-tx-list'
import { Heading } from '@/components/ui'
import { graphql } from '@/gql'
import { RgbppTransaction } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'

export const revalidate = 10
export const dynamic = 'force-static'

const query = graphql(`
  query RgbppLatestL1Transactions($limit: Int!) {
    rgbppLatestL1Transactions(limit: $limit) {
      txs {
        ckbTxHash
        btcTxid
        leapDirection
        blockNumber
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

export default async function Page({ params: { lang } }: { params: { lang: string } }) {
  const i18n = getI18nInstance(lang)
  const { rgbppLatestL1Transactions } = await graphQLClient.request(query, { limit: 10 })

  return (
    <Grid gridTemplateColumns="repeat(2, 1fr)" w="100%" maxW="content" p={{ base: '20px', xl: '30px' }} gap="30px">
      <Info i18n={i18n} />
      <Box bg="bg.card" rounded="8px" whiteSpace="nowrap" pb="12px" gridColumn="1/3">
        <Heading fontSize="20px" fontWeight="semibold" p="30px">{t(i18n)`Latest L1 RGB++ transaction`}</Heading>
        <ExplorerTxList<RgbppTransaction>
          txs={rgbppLatestL1Transactions.txs as RgbppTransaction[]}
          txid={(tx) => tx.btcTxid ?? ''}
        />
      </Box>
    </Grid>
  )
}
