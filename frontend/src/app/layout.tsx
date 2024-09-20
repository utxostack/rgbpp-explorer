import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import type { PropsWithChildren } from 'react'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
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
      <body className={montserrat.variable}>
        <Providers lang={locale}>
          <Navbar />
          {children}
          <Footer lang={locale} />
        </Providers>
      </body>
    </html>
  )
}
