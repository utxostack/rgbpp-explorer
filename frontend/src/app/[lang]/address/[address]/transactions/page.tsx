import { notFound } from 'next/navigation'

import { BtcTxList } from '@/app/[lang]/address/[address]/transactions/btc-tx-list'
import { CKBTxList } from '@/app/[lang]/address/[address]/transactions/ckb-tx-list'
import { isValidBTCAddress } from '@/lib/btc/is-valid-btc-address'
import { isValidCkbAddress } from '@/lib/ckb/is-valid-ckb-address'

export const maxDuration = 30

export default async function Page({ params: { address } }: { params: { address: string; lang: string } }) {
  if (isValidBTCAddress(address)) {
    return <BtcTxList address={address} />
  }

  if (isValidCkbAddress(address)) {
    return <CKBTxList address={address} />
  }
  return notFound()
}
