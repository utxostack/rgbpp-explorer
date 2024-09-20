import { I18n } from '@lingui/core'
import type { ComponentType, ReactNode } from 'react'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import type { LayoutProps } from '@/types/route'

export function withI18n<P = Record<string, string>, S = Record<string, string>>(
  component: (props: LayoutProps<P, S>, { i18n }: { i18n: I18n }) => ReactNode,
): ComponentType<LayoutProps<P, S>> {
  return (props: LayoutProps<P, S>) => {
    const i18n = getI18nInstance(props.params.lang)
    return component(props, { i18n })
  }
}

withI18n(function Layout(props, { i18n }) {
  return <div>123</div>
})
