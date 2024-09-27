import type { I18n } from '@lingui/core'
import { VStack } from 'styled-system/jsx'

import { BtcTransactionOverview } from '@/components/btc/btc-transaction-overview'
import { BtcUtxos } from '@/components/btc/btc-utxos'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { TransactionHeader } from '@/components/transaction-header'
import { BitcoinTransaction, CkbTransaction, LeapDirection } from '@/gql/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'

export function BTCTransactionPage({
  btcTransaction,
  ckbTransaction,
  leapDirection,
  i18n,
}: {
  btcTransaction: BitcoinTransaction
  ckbTransaction?: CkbTransaction | null
  leapDirection?: LeapDirection | null
  i18n: I18n
}) {
  return (
    <VStack w="100%" maxW="content" p={{ base: '20px', xl: '30px' }} gap={{ base: '20px', xl: '30px' }}>
      <TransactionHeader
        type={resolveLayerTypeFromRGBppTransaction({ ckbTransaction, leapDirection, btcTransaction })}
        txid={btcTransaction.txid}
        confirmations={btcTransaction.confirmations}
        i18n={i18n}
      />
      <BtcTransactionOverview i18n={i18n} btcTransaction={btcTransaction} />
      <BtcUtxos
        txid={btcTransaction.txid}
        vin={btcTransaction.vin}
        vout={btcTransaction.vout}
        ckbCell={ckbTransaction ?? undefined}
        i18n={i18n}
      />
      {ckbTransaction ? <CkbCells i18n={i18n} ckbTransaction={ckbTransaction} isBinding /> : null}
    </VStack>
  )
}
