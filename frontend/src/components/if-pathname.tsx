'use client'

import { useLingui } from '@lingui/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { isRoutePathname } from '@/lib/if-route-pathname'

interface IfPathname {
  exact?: boolean
  isOneOf?: string[]
  isNotOneOf?: string[]
  children: ReactNode
}

export function IfPathname({ exact = false, isOneOf, isNotOneOf, children }: IfPathname) {
  const pathname = usePathname()
  const {
    i18n: { locale },
  } = useLingui()
  if (isOneOf && isOneOf.some((includedPath) => isRoutePathname(pathname, `/${locale}${includedPath}`, exact))) {
    return <>{children}</>
  }
  if (isNotOneOf && !isNotOneOf.some((excludedPath) => isRoutePathname(pathname, `/${locale}${excludedPath}`, exact))) {
    return <>{children}</>
  }
  return null
}
