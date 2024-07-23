'use client'

import { useLingui } from '@lingui/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { HStack, HstackProps } from 'styled-system/jsx'

import Link from '@/components/ui/link'

export interface LinkTabsProps extends HstackProps {
  links: Array<{
    href: string
    label: ReactNode
  }>
}

export function LinkTabs({ links, ...props }: LinkTabsProps) {
  const pathname = usePathname()
  const {
    i18n: { locale },
  } = useLingui()

  const hasActive = links.some((link) => pathname === `/${locale}${link.href}`)
  if (!hasActive) {
    return null
  }

  return (
    <HStack gap="20px" {...props}>
      {links.map((link) => {
        const isActive = pathname === `/${locale}${link.href}`
        return (
          <Link
            href={link.href}
            key={link.href}
            rounded="4px"
            py="8px"
            px="16px"
            bg={isActive ? 'brand' : 'bg.card'}
            color={isActive ? 'text.primary' : 'text.third'}
            fontWeight="semibold"
            transitionDuration="normal"
            transitionProperty="color, background, border-color"
            transitionTimingFunction="default"
            _hover={{
              color: 'text.primary',
            }}
          >
            {link.label}
          </Link>
        )
      })}
    </HStack>
  )
}
