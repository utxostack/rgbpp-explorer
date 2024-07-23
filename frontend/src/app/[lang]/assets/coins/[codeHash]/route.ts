import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { getLocaleFromHeaders } from '@/app/[lang]/appRouterI18n'

export function GET(request: NextRequest, { params: { codeHash } }: { params: { codeHash: string } }) {
  const locale = getLocaleFromHeaders()
  return redirect(`/${locale}/assets/coins/${codeHash}/transactions`)
}
