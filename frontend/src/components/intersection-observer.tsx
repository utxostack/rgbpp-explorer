'use client'

import { Box, BoxProps } from 'styled-system/jsx'
import { useIntersectionObserver } from 'usehooks-ts'

export interface IntersectionObserverProps extends Omit<BoxProps, 'onChange'> {
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void
  threshold?: number
}

export function IntersectionObserver({ threshold = 0.5, children, onChange, ...props }: IntersectionObserverProps) {
  const { ref } = useIntersectionObserver({
    threshold,
    onChange,
  })

  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  )
}
