import 'server-only'

import type { LinguiConfig } from '@lingui/conf'
import { I18n, Messages, setupI18n } from '@lingui/core'
import linguiConfig from 'lingui.config.mjs'
import { headers } from 'next/headers'

const { locales } = linguiConfig as LinguiConfig
type SupportedLocales = string

async function loadCatalog(locale: SupportedLocales): Promise<{
  [k: string]: Messages
}> {
  const { messages } = await import(`../../locales/${locale}/messages.ts`)
  return {
    [locale]: messages,
  }
}
const catalogs: Array<{ [locale: string]: Messages }> = await Promise.all(locales.map(loadCatalog))

export const allMessages = catalogs.reduce((acc, oneCatalog) => {
  return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = { [K in SupportedLocales]: I18n }

export const allI18nInstances: AllI18nInstances = locales.reduce((acc, locale) => {
  const messages = allMessages[locale] ?? {}
  const i18n = setupI18n({
    locale,
    messages: { [locale]: messages },
  })
  return { ...acc, [locale]: i18n }
}, {})

export function getI18nInstance(locale: string) {
  return allI18nInstances[locale] ?? allI18nInstances[linguiConfig.sourceLocale!]
}

export function getLocaleFromHeaders() {
  const headersList = headers()
  return headersList.get('locale') ?? linguiConfig.sourceLocale!
}

export function getI18nFromHeaders() {
  return getI18nInstance(getLocaleFromHeaders())
}
