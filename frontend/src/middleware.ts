import type { LinguiConfig } from '@lingui/conf'
import Negotiator from 'negotiator'
import { type NextRequest, NextResponse } from 'next/server'

import linguiConfig from '../lingui.config.mjs'

const { locales } = linguiConfig as LinguiConfig

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
  if (pathnameHasLocale) return

  const locale = getRequestLocale(request.headers)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

function getRequestLocale(requestHeaders: Headers): string {
  const langHeader = requestHeaders.get('accept-language') || undefined
  const languages = new Negotiator({
    headers: { 'accept-language': langHeader },
  }).languages(locales.slice())

  return languages[0] || locales[0] || 'en'
}
