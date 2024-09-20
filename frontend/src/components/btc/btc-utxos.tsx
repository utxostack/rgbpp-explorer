'use client'

import { t } from '@lingui/macro'
import { Flex, HStack, VStack } from 'styled-system/jsx'

import BtcIcon from '@/assets/chains/btc.svg'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { ViewMemPool } from '@/components/view-mempool'
import { BitcoinInput, BitcoinOutput, BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export interface BtcUtxosProps extends Pick<BitcoinTransaction, 'txid' | 'vin' | 'vout'> {
  isBinding?: boolean
  ckbCell?: Pick<CkbTransaction, 'inputs' | 'outputs'>
}

export function BtcUtxos({ txid, vin, vout, isBinding, ckbCell }: BtcUtxosProps) {
  return (
    <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
      <Flex
        gap="20px"
        flexDir={{ base: 'column', md: 'row' }}
        w="100%"
        bg="bg.input"
        justifyContent="space-between"
        py="20px"
        px={{ base: '20px', lg: '30px' }}
        roundedTop="8px"
      >
        <HStack gap="16px">
          <BtcIcon h="40px" w="40px" />
          {isBinding ? (
            <VStack alignItems="start" gap={0}>
              <Text fontSize="16px" fontWeight="semibold">{t`RGB++ Binding Txn on BTC`}</Text>
              <Link
                href={`/transaction/${txid}`}
                color="brand"
                fontSize="14px"
                _hover={{
                  textDecoration: 'underline',
                }}
              >
                <IfBreakpoint breakpoint="lg" fallback={truncateMiddle(txid, 10, 10)}>
                  {txid}
                </IfBreakpoint>
              </Link>
            </VStack>
          ) : (
            <Text fontSize="16px" fontWeight="semibold">{t`BTC Txn`}</Text>
          )}
        </HStack>
        <ViewMemPool txid={txid} />
      </Flex>
      <BtcUtxoTables txid={txid} vin={vin as BitcoinInput[]} vout={vout as BitcoinOutput[]} ckbCell={ckbCell} />
    </VStack>
  )
}
