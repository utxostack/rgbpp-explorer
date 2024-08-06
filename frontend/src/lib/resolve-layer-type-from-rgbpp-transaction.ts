import { LeapDirection, RgbppTransaction } from '@/gql/graphql'

export function resolveLayerTypeFromRGBppTransaction(
  tx: Pick<RgbppTransaction, 'ckbTransaction' | 'btcTransaction' | 'leapDirection'>,
) {
  switch (tx.leapDirection) {
    case LeapDirection.LeapOut:
      return 'l2-l1'
    case LeapDirection.LeapIn:
      return 'l1-l2'
    case LeapDirection.Within:
      return 'l1'
    default:
      return
  }
}
