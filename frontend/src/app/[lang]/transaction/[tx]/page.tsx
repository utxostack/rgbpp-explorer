import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { BTCTransactionPage } from '@/app/[lang]/transaction/[tx]/btc'
import { CKBTransactionPage } from '@/app/[lang]/transaction/[tx]/ckb'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export const revalidate = 60

export default async function Page({ params: { tx } }: { params: { tx: string } }) {
  const i18n = getI18nFromHeaders()
  const res = await explorerGraphql.getTransaction(tx)
  if (!res?.rgbppTransaction) notFound()

  if (res.rgbppTransaction.btcTransaction && !tx.startsWith('0x')) {
    return (
      <BTCTransactionPage
        btcTransaction={res.rgbppTransaction.btcTransaction}
        ckbTransaction={res.rgbppTransaction.ckbTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }

  if (res.rgbppTransaction.ckbTransaction && tx.startsWith('0x')) {
    return (
      <CKBTransactionPage
        ckbTransaction={res.rgbppTransaction.ckbTransaction}
        btcTransaction={res.rgbppTransaction.btcTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }

  if (res.rgbppTransaction.btcTransaction) {
    return (
      <BTCTransactionPage
        btcTransaction={res.rgbppTransaction.btcTransaction}
        ckbTransaction={res.rgbppTransaction.ckbTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }

  if (res.rgbppTransaction.ckbTransaction) {
    return (
      <CKBTransactionPage
        ckbTransaction={res.rgbppTransaction.ckbTransaction}
        btcTransaction={res.rgbppTransaction.btcTransaction}
        leapDirection={res.rgbppTransaction.leapDirection}
      />
    )
  }
  throw new Error(t(i18n)`The transaction "${tx}" not found`)
}
