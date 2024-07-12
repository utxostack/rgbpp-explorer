import '@/styles/globals.css'

import { setI18n } from '@lingui/react/server'
import type { Metadata } from 'next'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { LinguiClientProvider } from '@/app/[lang]/LinguiClientProvider'
import { BaseAppRouterProps } from '@/types/BaseAppRouterProps'

export const metadata: Metadata = {
  title: 'UTXO Stack Explorer',
}

export default function RootLayout({ params: { lang }, children }: BaseAppRouterProps) {
  const i18n = getI18nInstance(lang)
  setI18n(i18n)

  return (
    <html lang={lang}>
      <body>
        <LinguiClientProvider initialLocale={lang} initialMessages={i18n.messages}>
          {children}
        </LinguiClientProvider>
      </body>
    </html>
  )
}
