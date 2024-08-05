import linguiConfig from 'lingui.config.mjs'
import { headers } from 'next/headers'

export function getLocaleFromHeaders() {
  const headersList = headers()
  return headersList.get('locale') ?? linguiConfig.sourceLocale!
}
