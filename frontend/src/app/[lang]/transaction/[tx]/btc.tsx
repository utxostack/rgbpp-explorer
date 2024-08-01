import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { BtcTransaction, CkbTransaction, LeapDirection } from '@/apis/types/explorer-graphql'
import { BtcTransactionOverflow } from '@/components/btc/btc-transaction-overflow'
import { BtcUtxos } from '@/components/btc/btc-utxos'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { Copier } from '@/components/copier'
import { LayerType } from '@/components/layer-type'
import { Heading, Text } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'

export function BTCTransactionPage({
  btcTransaction,
  ckbTransaction,
  leapDirection,
}: {
  btcTransaction: BtcTransaction
  ckbTransaction?: CkbTransaction
  leapDirection?: LeapDirection | null
}) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Transactions`}
        </Heading>
        <Copier value={btcTransaction.txid}>{btcTransaction.txid}</Copier>
        {leapDirection && ckbTransaction ? (
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
