import { setI18n } from '@lingui/react/server'
import { ReactNode } from 'react'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { LinguiClientProvider } from '@/app/[lang]/LinguiClientProvider'

interface Props {
  params: {
    lang: string
  }
  children: ReactNode
}

export default function RootLayout({ params: { lang }, children }: Props) {
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
