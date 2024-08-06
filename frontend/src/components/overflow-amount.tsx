import { ReactNode } from 'react'

import { Text } from '@/components/ui'

export function OverflowAmount({ amount, symbol }: { amount: string; symbol: ReactNode }) {
  const [int, float] = amount.split('.')
  return (
    <>
      {int}
      <Text as="span" fontSize="14px">
        {float ? `.${float}` : null}
        <Text as="span" fontSize="14px" ml="4px">
          {symbol}
        </Text>
      </Text>
    </>
  )
}
