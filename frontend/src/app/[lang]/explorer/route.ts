import { redirect } from 'next/navigation'

import { getLocaleFromHeaders } from '@/lib/get-locale-from-headers'

export function GET() {
  const locale = getLocaleFromHeaders()
  return redirect(`/${locale}/explorer/btc`)
}
