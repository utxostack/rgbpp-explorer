import { useMediaQuery } from 'usehooks-ts'

const breakpoints = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
} as const

export type Breakpoint = keyof typeof breakpoints

export function useBreakpoints(breakpoint: Breakpoint) {
  return useMediaQuery(`screen and (min-width: ${breakpoints[breakpoint]})`)
}
