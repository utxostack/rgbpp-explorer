'use client'

import type { Assign } from '@ark-ui/react'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useLingui } from '@lingui/react'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { forwardRef, PropsWithChildren } from 'react'
import { styled } from 'styled-system/jsx'
import type { JsxStyleProps } from 'styled-system/types'

export interface LinkProps
  extends Assign<JsxStyleProps, Omit<HTMLArkProps<'a'>, 'href'>>,
    NextLinkProps,
    PropsWithChildren {}
const StyledLink = styled(NextLink)

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ children, ...props }, ref) {
  const { i18n } = useLingui()
  const locale = props.locale ?? i18n.locale

  if (typeof props.href === 'string' && (props.href.startsWith('https://') || props.href.startsWith('http://'))) {
    return (
      <StyledLink ref={ref} {...props} href={props.href}>
        {children}
      </StyledLink>
    )
  }

  if (
    typeof props.href === 'object' &&
    (props.href.pathname?.startsWith('https://') || props.href.pathname?.startsWith('http://'))
  ) {
    return (
      <StyledLink ref={ref} {...props} href={props.href}>
        {children}
      </StyledLink>
    )
  }

  const href =
    typeof props.href === 'string'
      ? `/${locale}${props.href}`
      : {
          ...props.href,
          pathname: `/${locale}${props.href.pathname}`,
        }
  return (
    <StyledLink ref={ref} {...props} href={href}>
      {children}
    </StyledLink>
  )
})

export default Link
