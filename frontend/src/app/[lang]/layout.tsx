import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
import { BaseAppRouterPropsWithChildren } from '@/lib/types/BaseAppRouterProps'

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

export default function RootLayout({ params: { lang }, children }: BaseAppRouterPropsWithChildren) {
  return (
    <html lang={lang}>
      <body className={montserrat.variable}>
        <Providers lang={lang}>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
