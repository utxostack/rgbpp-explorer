import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { getLocaleFromHeaders } from '@/lib/get-locale-from-headers'

export function getI18nFromHeaders() {
  return getI18nInstance(getLocaleFromHeaders())
}
