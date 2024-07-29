import { LeapDirection, RGBppTransaction } from '@/apis/types/explorer-graphql'

export function resolveLayerTypeFromRGBppTransaction(
  tx: Pick<RGBppTransaction, 'ckbTransaction' | 'btcTransaction' | 'leapDirection'>,
) {
  switch (tx.leapDirection) {
    case LeapDirection.Out:
      return 'l2-l1'
    case LeapDirection.In:
      return 'l1-l2'
    case LeapDirection.Within:
      if (tx.ckbTransaction) return 'l2'
      if (tx.btcTransaction) return 'l1'
      return
    default:
      if (tx.ckbTransaction) return 'l2'
      if (tx.btcTransaction) return 'l1'
      return
  }
}
