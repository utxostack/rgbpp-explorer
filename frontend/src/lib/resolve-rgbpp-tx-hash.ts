import { RgbppTransaction } from '@/gql/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'

export function resolveRGBppTxHash(tx: Pick<RgbppTransaction, 'ckbTransaction' | 'btcTransaction' | 'leapDirection'>) {
  const type = resolveLayerTypeFromRGBppTransaction(tx)
  if (!type) return tx.ckbTransaction?.hash
  switch (type) {
    case 'l1-l2':
    case 'l1':
      return tx.btcTransaction?.txid ?? tx.ckbTransaction?.hash
    case 'l2':
    case 'l2-l1':
      return tx.ckbTransaction?.hash ?? tx.btcTransaction?.txid
  }
}
