import { NextRequest, NextResponse } from 'next/server'

import { explorerGraphql } from '@/apis/explorer-graphql'

export const revalidate = 60

export async function GET(request: NextRequest, { params: { keyword } }: { params: { keyword: string } }) {
  const ckbTxResponse = await explorerGraphql.getCkbTransaction(keyword).catch(() => null)
  const btcTxResponse = await explorerGraphql.getBtcTransaction(keyword).catch(() => null)
  // TODO: search address
  // TODO: assets id

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}
