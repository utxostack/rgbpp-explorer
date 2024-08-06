import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { BtcUtxos } from '@/components/btc/btc-utxos'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { CkbTransactionOverview } from '@/components/ckb/ckb-transaction-overview'
import { Copier } from '@/components/copier'
import { LayerType } from '@/components/layer-type'
import { Heading, Text } from '@/components/ui'
import { BitcoinTransaction, CkbTransaction, LeapDirection } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { formatNumber } from '@/lib/string/format-number'

export function CKBTransactionPage({
  ckbTransaction,
  btcTransaction,
  leapDirection,
}: {
  ckbTransaction: CkbTransaction
  btcTransaction?: BitcoinTransaction | null
  leapDirection?: LeapDirection | null
}) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Transactions`}
        </Heading>
        <Copier value={ckbTransaction.hash}>{ckbTransaction.hash}</Copier>
        {btcTransaction ? (
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
            {t(i18n)`Confirmations`}
          </Text>
        </Box>
      </HStack>
      <CkbTransactionOverview ckbTransaction={ckbTransaction} />
      <CkbCells ckbTransaction={ckbTransaction} />
      {btcTransaction ? (
        <BtcUtxos txid={btcTransaction.txid} vin={btcTransaction.vin} vout={btcTransaction.vout} isBinding />
      ) : null}
    </VStack>
  )
}
