import { setI18n } from '@lingui/react/server'
import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { LinguiClientProvider } from '@/app/[lang]/LinguiClientProvider'
import { queryClient } from '@/configs/query-client'

export function Providers({ lang, children }: { lang: string } & PropsWithChildren) {
  const i18n = getI18nInstance(lang)
  setI18n(i18n)
  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={i18n.messages}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LinguiClientProvider>
  )
}
