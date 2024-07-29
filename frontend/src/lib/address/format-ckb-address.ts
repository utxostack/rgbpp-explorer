import { truncateMiddle } from '@/lib/string/truncate-middle'

export function formatCkbAddress(ckbAddress: string) {
  return truncateMiddle(ckbAddress)
}
