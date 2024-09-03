'use client'

import { Trans } from '@lingui/macro'
import dayjs from 'dayjs'
import { Box, HStack, styled, VStack } from 'styled-system/jsx'

import BtcIcon from '@/assets/chains/btc.svg'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { TextOverflowTooltip } from '@/components/text-overflow-tooltip'
import { Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { DATE_TEMPLATE } from '@/constants'
import { RgbppCoin } from '@/gql/graphql'
import { formatNumber } from '@/lib/string/format-number'

export function CoinList<
  T extends Pick<
    RgbppCoin,
    | 'typeHash'
    | 'icon'
    | 'symbol'
    | 'holdersCount'
    | 'h24CkbTransactionsCount'
    | 'totalAmount'
    | 'decimal'
    | 'deployedAt'
  >,
>({ coins }: { coins: T[] }) {
  return (
    <IfBreakpoint breakpoint="lg" fallback={<CoinListGrid coins={coins} />}>
      <Table.Root w="100%" tableLayout="fixed">
        <Table.Head>
          <Table.Row>
            <Table.Header>
              <Trans>Coin</Trans>
            </Table.Header>
            <Table.Header>
              <Trans>L1 and L2 Holders</Trans>
            </Table.Header>
            <Table.Header>
              <Trans>Txns(24H)</Trans>
            </Table.Header>
            <Table.Header>
              <Trans>Supply</Trans>
            </Table.Header>
            <Table.Header>
              <Trans>Deploy Time</Trans>
            </Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {coins.map((coin) => {
            return (
              <Table.Row key={coin.typeHash}>
                <Table.Cell>
                  <Link
                    href={`/assets/coins/${coin.typeHash}`}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    color="text.link"
                    cursor="pointer"
                  >
                    {coin.icon ? (
                      <styled.img w="32px" h="32px" src={coin.icon} rounded="100%" />
                    ) : (
                      <BtcIcon w="32px" h="32px" />
                    )}
                    <TextOverflowTooltip label={coin.symbol}>
                      <Text maxW="200px" truncate cursor="pointer">
                        {coin.symbol}
                      </Text>
                    </TextOverflowTooltip>
                  </Link>
                </Table.Cell>
                <Table.Cell>{formatNumber(coin.holdersCount)}</Table.Cell>
                <Table.Cell>{formatNumber(coin.h24CkbTransactionsCount)}</Table.Cell>
                <Table.Cell>{formatNumber(coin.totalAmount, coin.decimal)}</Table.Cell>
                <Table.Cell>{coin.deployedAt ? dayjs(coin.deployedAt).format(DATE_TEMPLATE) : '-'}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </IfBreakpoint>
  )
}

export function CoinListGrid<
  T extends Pick<
    RgbppCoin,
    | 'typeHash'
    | 'icon'
    | 'symbol'
    | 'holdersCount'
    | 'h24CkbTransactionsCount'
    | 'totalAmount'
    | 'decimal'
    | 'deployedAt'
  >,
>({ coins }: { coins: T[] }) {
  return (
    <VStack gap={0} w="100%">
      {coins.map((coin) => {
        return (
          <Link
            href={`/assets/coins/${coin.typeHash}`}
            display="grid"
            w="100%"
            gap="16px"
            gridTemplateColumns="repeat(2, 1fr)"
            key={coin.typeHash}
            p="20px"
            borderBottom="1px solid"
            borderBottomColor="border.primary"
            _hover={{
              bg: 'bg.card.hover',
            }}
          >
            <HStack w="100%" gridColumn="1/3" color="brand">
              {coin.icon ? (
                <styled.img w="32px" h="32px" src={coin.icon} rounded="100%" />
              ) : (
                <BtcIcon w="32px" h="32px" />
              )}
              <TextOverflowTooltip label={coin.symbol}>
                <Text maxW="200px" truncate cursor="pointer">
                  {coin.symbol}
                </Text>
              </TextOverflowTooltip>
            </HStack>
            {[
              {
                label: <Trans>L1 and L2 Holders</Trans>,
                value: formatNumber(coin.holdersCount),
              },
              {
                label: <Trans>Txns(24H)</Trans>,
                value: formatNumber(coin.h24CkbTransactionsCount),
              },
              {
                label: <Trans>Supply</Trans>,
                value: formatNumber(coin.totalAmount, coin.decimal),
              },
              {
                label: <Trans>Deploy Time</Trans>,
                value: coin.deployedAt ? dayjs(coin.deployedAt).format(DATE_TEMPLATE) : '-',
              },
            ].map((x, i) => {
              return (
                <VStack fontSize="14px" w="100%" alignItems="start" fontWeight="medium" key={i} gap="4px">
                  <Box color="text.third">{x.label}</Box>
                  <Box>{x.value}</Box>
                </VStack>
              )
            })}
          </Link>
        )
      })}
    </VStack>
  )
}
