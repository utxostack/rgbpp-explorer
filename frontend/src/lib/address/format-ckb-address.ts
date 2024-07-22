import { truncateMiddle } from '@/lib/string/truncate-middle'
import { CkbAddress } from '@/lib/types/address'

export function formatCkbAddress(ckbAddress: CkbAddress) {
  return truncateMiddle(ckbAddress)
}
