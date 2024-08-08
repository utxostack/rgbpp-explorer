import { LeapDirection, RgbppTransaction } from '@/gql/graphql'

export function resolveLayerTypeFromRGBppTransaction(
  tx: Pick<RgbppTransaction, 'ckbTransaction' | 'btcTransaction' | 'leapDirection'>,
) {
  switch (tx.leapDirection) {
    case LeapDirection.LeapOut:
      return 'l1-l2'
    case LeapDirection.LeapIn:
      return 'l2-l1'
    case LeapDirection.Within:
      return 'l1'
    default:
      if (tx.btcTransaction) return 'l2-l1'
      return 'l2'
  }
}
