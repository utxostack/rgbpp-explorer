import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Box, Flex, HStack, VStack } from 'styled-system/jsx'

import { BtcTransaction } from '@/apis/types/explorer-graphql'
import BtcIcon from '@/assets/chains/btc.svg'
import { BtcTransactionOverflow } from '@/components/btc/btc-transaction-overflow'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'
import { ViewMemPool } from '@/components/view-mempool'

export function BTCTransactionPage({ btcTransaction }: { btcTransaction: BtcTransaction }) {
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Transactions`}
        </Heading>
        <Copier value={btcTransaction.txid}>{btcTransaction.txid}</Copier>
        <Box
          color="brand"
          fontWeight="semibold"
          fontSize="20px"
          lineHeight="24px"
          py="4px"
          px="12px"
          rounded="4px"
          bg="brand.a10"
          border="1px solid currentColor"
          ml="auto"
        >
          {btcTransaction.confirmations}{' '}
          <Text as="span" fontSize="14px" fontWeight="medium">
            {t(i18n)`confirmations`}
          </Text>
        </Box>
      </HStack>
      <BtcTransactionOverflow btcTransaction={btcTransaction} />
      <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
        <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
          <HStack gap="16px">
            <BtcIcon h="40px" w="40px" />
            <Text fontSize="16px" fontWeight="semibold">{t(i18n)`BTC Txn`}</Text>
          </HStack>
          <ViewMemPool txid={btcTransaction.txid} />
        </Flex>
        <BtcUtxoTables vin={btcTransaction.vin} vout={btcTransaction.vout} />
      </VStack>
    </VStack>
  )
}
