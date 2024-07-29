import { redirect } from 'next/navigation'

import { BtcTransactionsByAddress } from '@/app/[lang]/address/[address]/transactions/btc'
import { CkbTransactionsByAddress } from '@/app/[lang]/address/[address]/transactions/ckb'
import { isValidBTCAddress } from '@/lib/btc/is-valid-btc-address'
import { isValidCkbAddress } from '@/lib/ckb/is-valid-ckb-address'

export default function Page({ params: { address } }: { params: { address: string } }) {
  if (isValidBTCAddress(address)) {
    return <BtcTransactionsByAddress address={address} />
  }

  if (isValidCkbAddress(address)) {
    return <CkbTransactionsByAddress address={address} />
  }
  return redirect('/')
}
