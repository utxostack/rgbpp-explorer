'use client'

import type { PropsWithChildren, ReactNode } from 'react'

import { type Breakpoint, useBreakpoints } from '@/hooks/useBreakpoints'

export function IfBreakpoint({
  breakpoint,
  fallback,
  children,
}: PropsWithChildren<{ breakpoint: Breakpoint; fallback?: ReactNode }>) {
  const isMatch = useBreakpoints(breakpoint)
  if (isMatch) return children
  return fallback
}
