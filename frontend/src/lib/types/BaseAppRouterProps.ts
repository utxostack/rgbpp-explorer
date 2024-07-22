import type { PropsWithChildren } from 'react'

export interface BaseAppRouterProps {
  params: {
    lang: string
  }
}

export interface BaseAppRouterPropsWithChildren extends PropsWithChildren, BaseAppRouterProps {
  params: {
    lang: string
  }
}
