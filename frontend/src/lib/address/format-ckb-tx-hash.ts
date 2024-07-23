import { truncateMiddle } from '@/lib/string/truncate-middle'

export function formatCkbTxHash(txHash: string) {
  return truncateMiddle(txHash, 10, 8)
}
