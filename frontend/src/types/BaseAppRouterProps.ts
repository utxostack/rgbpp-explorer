import type { PropsWithChildren } from 'react'

export interface BaseAppRouterProps extends PropsWithChildren {
  params: {
    lang: string
  }
}
