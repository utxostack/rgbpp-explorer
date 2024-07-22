import linguiConfig from 'lingui.config.mjs'
import Negotiator from 'negotiator'
import { type NextRequest, NextResponse } from 'next/server'

const { locales } = linguiConfig

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
  const headers = new Headers(request.headers)
  headers.set('x-url', request.url)
  headers.set('x-pathname', request.nextUrl.pathname)
  if (pathnameHasLocale) {
    headers.set('locale', pathnameHasLocale)
    return NextResponse.next({
      request: {
        headers,
      },
    })
  }

  const locale = getRequestLocale(request.headers)
  request.nextUrl.pathname = `/${locale}${pathname}`

  headers.set('x-url', request.nextUrl.toString())
  headers.set('locale', locale)
  return NextResponse.redirect(request.nextUrl, {
    headers,
  })
}

function getRequestLocale(requestHeaders: Headers): string {
  const langHeader = requestHeaders.get('accept-language') || undefined
  const languages = new Negotiator({
    headers: { 'accept-language': langHeader },
  }).languages(locales.slice())

  return languages[0] || locales[0] || linguiConfig.sourceLocale!
}
