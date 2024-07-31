import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { BtcTransaction, CkbTransaction, LeapDirection } from '@/apis/types/explorer-graphql'
import { BtcUtxos } from '@/components/btc/btc-utxos'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { CkbTransactionOverflow } from '@/components/ckb/ckb-transaction-overflow'
import { Copier } from '@/components/copier'
import { LayerType } from '@/components/layer-type'
import { Heading, Text } from '@/components/ui'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { formatNumber } from '@/lib/string/format-number'

export function CKBTransactionPage({
  ckbTransaction,
  btcTransaction,
  leapDirection,
}: {
  ckbTransaction: CkbTransaction
  btcTransaction?: BtcTransaction
  leapDirection?: LeapDirection | null
}) {
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Transactions`}
        </Heading>
        <Copier value={ckbTransaction.hash}>{ckbTransaction.hash}</Copier>
        {leapDirection && btcTransaction ? (
          <LayerType type={resolveLayerTypeFromRGBppTransaction({ ckbTransaction, leapDirection, btcTransaction })} />
        ) : null}
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
          {formatNumber(ckbTransaction.confirmations)}{' '}
          <Text as="span" fontSize="14px" fontWeight="medium">
            {t(i18n)`confirmations`}
          </Text>
        </Box>
      </HStack>
      <CkbTransactionOverflow ckbTransaction={ckbTransaction} />
      <CkbCells ckbTransaction={ckbTransaction} />
      {btcTransaction ? (
        <BtcUtxos txid={btcTransaction.txid} vin={btcTransaction.vin} vout={btcTransaction.vout} />
      ) : null}
    </VStack>
  )
}
