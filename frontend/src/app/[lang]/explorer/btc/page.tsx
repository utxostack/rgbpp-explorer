import { t } from '@lingui/macro'
import { Box, Grid, styled } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { Info } from '@/app/[lang]/explorer/btc/info'
import BtcIcon from '@/assets/chains/btc.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { Heading, Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export const revalidate = 5

export default async function Page() {
  const i18n = getI18nFromHeaders()
  const { rgbppLatestTransactions } = await explorerGraphql.getRGBppLatestTransactions()
  const { rgbppCoins } = await explorerGraphql.getRGBppCoins({ page: 1, pageSize: 10 })

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
                      {truncateMiddle(tx.btcTxid, 10, 8)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell w="165px">
                    <AgoTimeFormatter time={tx.timestamp} tooltip />
                  </Table.Cell>
                  <Table.Cell>
                    <Amount ckbTransaction={tx.ckbTransaction} />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </Box>
      <Box bg="bg.card" rounded="8px" pb="12px">
        <Heading fontSize="20px" fontWeight="semibold" p="30px">{t(i18n)`🔥 Popular RGB++ Assets`}</Heading>
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
                      {coin.icon ? <styled.img w="36px" h="36px" src={coin.icon} /> : <BtcIcon w="36px" h="36px" />}
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
