import '@/styles/globals.css'

import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import type { PropsWithChildren } from 'react'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
import { env } from '@/constants/env'
import { getLocaleFromHeaders } from '@/lib/get-locale-from-headers'

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  fallback: ['Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'RGB++ Explorer',
  icons: '/logo.svg',
}

export default function RootLayout({ children }: PropsWithChildren) {
  const locale = getLocaleFromHeaders()
  return (
    <html lang={locale}>
      <body className={`${montserrat.variable}`}>
        {env.share.GA_ID ? <GoogleAnalytics gaId={env.share.GA_ID} /> : null}
        <Providers lang={locale}>
          <Navbar />
          {children}
          <Footer lang={locale} />
        </Providers>
      </body>
    </html>
  )
}
