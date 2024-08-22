import dayjs from 'dayjs'
import { BoxProps, HStack } from 'styled-system/jsx'

import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { Text } from '@/components/ui'
import { TIME_TEMPLATE } from '@/constants'

export function TimeFormatter({
  timestamp,
  alwaysShowAgo = false,
  ...props
}: { timestamp: number; alwaysShowAgo?: boolean } & BoxProps) {
  const ago = (
    <Text color="text.third">
      (<AgoTimeFormatter time={timestamp} />)
    </Text>
  )
  return (
    <HStack fontSize="14px" fontWeight="medium" {...props}>
      {dayjs(timestamp).format(TIME_TEMPLATE)}
      {alwaysShowAgo ? ago : <IfBreakpoint breakpoint="sm">{ago}</IfBreakpoint>}
    </HStack>
  )
}
