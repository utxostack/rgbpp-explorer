import { headers } from 'next/headers'

import linguiConfig from 'lingui.config.mjs'

export function getLocaleFromHeaders() {
  const headersList = headers()
  return headersList.get('locale') ?? linguiConfig.sourceLocale!
}
