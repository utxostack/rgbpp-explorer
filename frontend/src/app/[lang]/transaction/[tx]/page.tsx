import { redirect } from 'next/navigation'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { BTCTransactionPage } from '@/app/[lang]/transaction/[tx]/btc'
import { CKBTransactionPage } from '@/app/[lang]/transaction/[tx]/ckb'

export const revalidate = 60

export default async function Page({ params: { tx } }: { params: { tx: string } }) {
  const res = await explorerGraphql.getTransaction(tx).catch(() => null)
  if (!res?.rgbppTransaction) return redirect('/404')
  if (res.rgbppTransaction.ckbTransaction) {
    return (
      <CKBTransactionPage
        ckbTransaction={res.rgbppTransaction.ckbTransaction}
        btcTransaction={res.rgbppTransaction.btcTransaction}
      />
    )
  }
  if (res.rgbppTransaction.btcTransaction) {
    return (
      <BTCTransactionPage
        btcTransaction={res.rgbppTransaction.btcTransaction}
        ckbTransaction={res.rgbppTransaction.ckbTransaction}
      />
    )
  }
  return redirect('/404')
}
