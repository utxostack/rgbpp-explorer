import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { getLocaleFromHeaders } from '@/lib/get-locale-from-headers'

export function GET(request: NextRequest, { params: { typeHash } }: { params: { typeHash: string } }) {
  const locale = getLocaleFromHeaders()
  return redirect(`/${locale}/assets/coins/${typeHash}/transactions`)
}
