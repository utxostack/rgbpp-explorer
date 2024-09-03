'use client'

import { Box, Flex, VStack } from 'styled-system/jsx'

import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Amount } from '@/components/latest-tx-list/amount'
import { LayerType } from '@/components/layer-type'
import { TextOverflowTooltip } from '@/components/text-overflow-tooltip'
import { Table } from '@/components/ui'
import Link from '@/components/ui/link'
import { CkbTransaction, RgbppTransaction } from '@/gql/graphql'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export function ExplorerTxListUI<
  T extends Pick<RgbppTransaction, 'ckbTransaction' | 'timestamp' | 'btcTransaction' | 'leapDirection'> & {
    txid: string
  },
>({ txs }: { txs: T[] }) {
  const isMd = useBreakpoints('md')

  if (!isMd) {
    return txs.map(({ txid, ...tx }) => {
      const amount = <Amount ckbTransaction={tx.ckbTransaction as CkbTransaction} />
      return (
        <Link
          href={`/transaction/${txid}`}
          display="grid"
          gridTemplateColumns="repeat(2, calc(50% - 4px))"
          gap="8px"
          key={txid}
          w="100%"
          justifyContent="space-between"
          py="16px"
          px="20px"
          borderBottom="1px solid"
          borderBottomColor="border.primary"
          transition="100ms"
          _hover={{
            bg: 'bg.card.hover',
          }}
        >
          <VStack fontSize="14px" alignItems="start" gap="4px">
            <Box color="text.link">{truncateMiddle(txid ?? '', 6, 6)}</Box>
            <Box fontWeight="medium" color="text.secondary">
              <AgoTimeFormatter time={tx.timestamp} tooltip />
            </Box>
          </VStack>
          <Flex flexDir="column" alignItems="end" justifyContent="center">
            <TextOverflowTooltip label={amount}>
              <Box truncate w="100%" textAlign="right">
                {amount}
              </Box>
            </TextOverflowTooltip>
          </Flex>
        </Link>
      )
    })
  }

  return (
    <Table.Root tableLayout="fixed">
      <Table.Body>
        {txs.map(({ txid, ...tx }) => {
          return (
            <Table.Row key={txid} lineHeight="36px">
              <Table.Cell w="235px">
                <Link href={`/transaction/${txid}`} display="flex" alignItems="center" gap={3} color="text.link">
                  {truncateMiddle(txid ?? '', 10, 8)}
                </Link>
              </Table.Cell>
              <Table.Cell w="140px" display={{ base: 'none', lg: 'table-cell' }}>
                <LayerType type={resolveLayerTypeFromRGBppTransaction(tx)} />
              </Table.Cell>
              <Table.Cell w="140px">
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
  )
}
