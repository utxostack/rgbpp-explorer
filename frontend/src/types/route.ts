import type { ReactNode } from 'react'

export interface LayoutProps<P = Record<string, string>, S = Record<string, string>> {
  children: ReactNode
  params: { lang: string } & P
  searchParams: S
}
