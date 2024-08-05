import dayjs from 'dayjs'
import { HStack } from 'styled-system/jsx'

import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Text } from '@/components/ui'
import { TIME_TEMPLATE } from '@/constants'

export function TimeFormatter({ timestamp }: { timestamp: number }) {
  return (
    <HStack fontSize="14px" fontWeight="medium" ml="auto">
      {dayjs(timestamp).format(TIME_TEMPLATE)}
      <Text color="text.third">
        (<AgoTimeFormatter time={timestamp} />)
      </Text>
    </HStack>
  )
}
