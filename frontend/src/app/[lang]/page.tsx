import { t } from '@lingui/macro'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { Link } from '@/components/ui/link'
import type { BaseAppRouterProps } from '@/types/BaseAppRouterProps'

export default function Home({ params: { lang } }: BaseAppRouterProps) {
  const i18n = getI18nInstance(lang)
  return (
    <Link href="/about" bg="#000" color="white" locale="en">
      {t(i18n)`Test`}
      /About
    </Link>
  )
}
