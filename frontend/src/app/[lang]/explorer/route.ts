import { redirect } from 'next/navigation'

import { getLocaleFromHeaders } from '@/app/[lang]/appRouterI18n'

export function GET() {
  const locale = getLocaleFromHeaders()
  return redirect(`/${locale}/explorer/btc`)
}
