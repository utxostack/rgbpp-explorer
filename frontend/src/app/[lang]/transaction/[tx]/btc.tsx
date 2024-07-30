import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { BtcTransaction, CkbTransaction } from '@/apis/types/explorer-graphql'
import { BtcTransactionOverflow } from '@/components/btc/btc-transaction-overflow'
import { BtcUtxos } from '@/components/btc/btc-utxos'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'

export function BTCTransactionPage({
  btcTransaction,
  ckbTransaction,
}: {
  btcTransaction: BtcTransaction
  ckbTransaction?: CkbTransaction
}) {
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
      <BtcUtxos txid={btcTransaction.txid} vin={btcTransaction.vin} vout={btcTransaction.vout} />
      {ckbTransaction ? <CkbCells ckbTransaction={ckbTransaction} /> : null}
    </VStack>
  )
}
