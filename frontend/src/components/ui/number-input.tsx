import { forwardRef } from 'react'

import * as StyledNumberInput from '@/components/ui/primitives/number-input'

export interface NumberInputProps extends StyledNumberInput.RootProps {}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>((props, ref) => {
  const { children, ...rootProps } = props
  return (
    <StyledNumberInput.Root ref={ref} {...rootProps}>
      {children ? <StyledNumberInput.Label>{children}</StyledNumberInput.Label> : null}
      <StyledNumberInput.Control>
        <StyledNumberInput.Input />
        <StyledNumberInput.IncrementTrigger>
          <ChevronUpIcon />
        </StyledNumberInput.IncrementTrigger>
        <StyledNumberInput.DecrementTrigger>
          <ChevronDownIcon />
        </StyledNumberInput.DecrementTrigger>
      </StyledNumberInput.Control>
    </StyledNumberInput.Root>
  )
})

NumberInput.displayName = 'NumberInput'

function ChevronUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Chevron Up Icon</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m18 15l-6-6l-6 6"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Chevron Down Icon</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m6 9l6 6l6-6"
      />
    </svg>
  )
}
