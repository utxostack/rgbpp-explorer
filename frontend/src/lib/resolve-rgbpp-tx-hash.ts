import { RgbppTransaction } from '@/gql/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'

export function resolveRGBppTxHash(tx: Pick<RgbppTransaction, 'btcTxid' | 'ckbTxHash' | 'leapDirection'>) {
  const type = resolveLayerTypeFromRGBppTransaction(tx)
  if (!type) return tx.ckbTxHash
  switch (type) {
    case 'l1-l2':
    case 'l1':
      return tx.btcTxid ?? tx.ckbTxHash
    case 'l2':
    case 'l2-l1':
      return tx.ckbTxHash ?? tx.btcTxid
  }
}
