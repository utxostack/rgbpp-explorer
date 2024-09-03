import { VStack } from 'styled-system/jsx'

import { BtcUtxos } from '@/components/btc/btc-utxos'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { CkbTransactionOverview } from '@/components/ckb/ckb-transaction-overview'
import { TransactionHeader } from '@/components/transaction-header'
import { BitcoinTransaction, CkbTransaction, LeapDirection } from '@/gql/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'

export function CKBTransactionPage({
  ckbTransaction,
  btcTransaction,
  leapDirection,
}: {
  ckbTransaction: CkbTransaction
  btcTransaction?: BitcoinTransaction | null
  leapDirection?: LeapDirection | null
}) {
  return (
    <VStack w="100%" maxW="content" p={{ base: '20px', xl: '30px' }} gap={{ base: '20px', xl: '30px' }}>
      <TransactionHeader
        type={resolveLayerTypeFromRGBppTransaction({ ckbTransaction, leapDirection, btcTransaction })}
        txid={ckbTransaction.hash}
        confirmations={ckbTransaction.confirmations}
      />
      <CkbTransactionOverview ckbTransaction={ckbTransaction} />
      <CkbCells ckbTransaction={ckbTransaction} />
      {btcTransaction ? (
        <BtcUtxos
          txid={btcTransaction.txid}
          vin={btcTransaction.vin}
          vout={btcTransaction.vout}
          isBinding
          ckbCell={ckbTransaction}
        />
      ) : null}
    </VStack>
  )
}
