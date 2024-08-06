import { t } from '@lingui/macro'
import { Box, Grid, HStack, styled } from 'styled-system/jsx'

import { Info } from '@/app/[lang]/explorer/btc/info'
import ArrowIcon from '@/assets/arrow.svg'
import BtcIcon from '@/assets/chains/btc.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { Heading, Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { CkbTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export const revalidate = 5
const queryRgbppCoins = graphql(`
  query RgbppCoins($page: Int!, $pageSize: Int!) {
    rgbppCoins(page: $page, pageSize: $pageSize) {
      total
      pageSize
      coins {
        icon
        name
        symbol
        holdersCount
        h24CkbTransactionsCount
        totalAmount
        deployedAt
        decimal
        typeHash
      }
    }
  }
`)

const queryRgbppLatestTransactions = graphql(`
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

export default async function Page() {
  const i18n = getI18nFromHeaders()
  const { rgbppLatestTransactions } = await graphQLClient.request(queryRgbppLatestTransactions, {
    page: 1,
    pageSize: 10,
  })
  const { rgbppCoins } = await graphQLClient.request(queryRgbppCoins, { page: 1, pageSize: 10 })

  return (
    <Grid gridTemplateColumns="repeat(2, 1fr)" w="100%" maxW="content" p="30px" gap="30px">
      <Info />
      <Box bg="bg.card" rounded="8px" whiteSpace="nowrap" pb="12px">
        <Heading fontSize="20px" fontWeight="semibold" p="30px">{t(i18n)`Latest L1 RGB++ transaction`}</Heading>
        <Table.Root>
          <Table.Body>
            {rgbppLatestTransactions.txs.map((tx) => {
              return (
                <Table.Row key={tx.btcTxid} lineHeight="36px">
                  <Table.Cell>
                    <Link
                      href={`/transaction/${tx.btcTxid}`}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      color="text.link"
                    >
                      {truncateMiddle(tx.btcTxid ?? '', 10, 8)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell w="165px">
                    <AgoTimeFormatter time={tx.timestamp} tooltip />
                  </Table.Cell>
                  <Table.Cell>
                    <Amount ckbTransaction={tx.ckbTransaction as CkbTransaction} />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Box>
      <Box bg="bg.card" rounded="8px" pb="12px">
        <HStack p="30px" w="100%">
          <Heading fontSize="20px" fontWeight="semibold">
            {t(i18n)`🔥 Popular RGB++ Assets`}
          </Heading>
          <Link href="/assets/coins" ml="auto">
            <ArrowIcon w="26px" h="20px" />
          </Link>
        </HStack>
        <Table.Root>
          <Table.Body>
            {rgbppCoins.coins.map((coin) => {
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
                      {coin.icon ? (
                        <styled.img w="36px" h="36px" src={coin.icon} rounded="100%" />
                      ) : (
                        <BtcIcon w="36px" h="36px" />
                      )}
                      <Text>{coin.symbol}</Text>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    {coin.h24CkbTransactionsCount}{' '}
                    <Text as="span" color="text.third" ml="4px">{t(i18n)`Txns(24H)`}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {coin.holdersCount} <Text as="span" color="text.third" ml="4px">{t(i18n)`Holders`}</Text>
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
