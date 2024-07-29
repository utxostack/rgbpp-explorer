import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { getLocaleFromHeaders } from '@/lib/get-locale-from-headers'

export function GET(request: NextRequest, { params: { hashOrHeight } }: { params: { hashOrHeight: string } }) {
  const locale = getLocaleFromHeaders()
  return redirect(`/${locale}/block/ckb/${hashOrHeight}/transactions`)
}
