import { ExplorerTxListUI } from '@/components/explorer-tx-list/ui'
import { RgbppTransaction } from '@/gql/graphql'

export function ExplorerTxList<
  T extends Pick<RgbppTransaction, 'ckbTransaction' | 'timestamp' | 'btcTransaction' | 'leapDirection'>,
>({ txs, txid }: { txs: T[]; txid: (tx: T) => string }) {
  return <ExplorerTxListUI txs={txs.map((tx) => ({ ...tx, txid: txid(tx) ?? '' }))} />
}
