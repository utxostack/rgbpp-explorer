import { truncateMiddle } from '@/lib/string/truncate-middle'

export function formatCkbTxHash(txHash?: string) {
  return txHash ? truncateMiddle(txHash, 10, 8) : undefined
}
