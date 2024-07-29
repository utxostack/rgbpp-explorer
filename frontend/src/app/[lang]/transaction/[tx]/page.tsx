import { redirect } from 'next/navigation'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { BTCTransactionPage } from '@/app/[lang]/transaction/[tx]/btc'
import { CKBTransactionPage } from '@/app/[lang]/transaction/[tx]/ckb'

export const revalidate = 60

export default async function Page({ params: { tx } }: { params: { tx: string } }) {
  const ckbRes = await explorerGraphql.getCkbTransaction(tx).catch(() => null)
  if (ckbRes?.ckbTransaction) {
    return <CKBTransactionPage ckbTransaction={ckbRes.ckbTransaction} />
  }
  const btcRes = await explorerGraphql.getBtcTransaction(tx).catch(() => null)
  if (btcRes?.btcTransaction) {
    return <BTCTransactionPage btcTransaction={btcRes.btcTransaction} />
  }
  return redirect('/')
}
