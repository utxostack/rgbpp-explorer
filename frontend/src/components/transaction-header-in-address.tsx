import { Flex } from 'styled-system/jsx'

import { Copier } from '@/components/copier'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { TimeFormatter } from '@/components/time-formatter'
import Link from '@/components/ui/link'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export function TransactionHeaderInAddress({
  txid,
  time,
  btcTime,
}: {
  txid: string
  time?: number
  btcTime?: boolean
}) {
  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      gap={{ base: '10px', sm: 0 }}
      w="100%"
      bg="bg.input"
      justifyContent="space-between"
      py="20px"
      px={{ base: '20px', xl: '30px' }}
      roundedTop="8px"
    >
      <Copier value={txid} onlyIcon>
        <Link color="brand" href={`/transaction/${txid}`}>
          <IfBreakpoint breakpoint="lg" fallback={truncateMiddle(txid, 10, 10)}>
            {txid}
          </IfBreakpoint>
        </Link>
      </Copier>
      {time ? <TimeFormatter alwaysShowAgo timestamp={btcTime ? resolveBtcTime(time) : time} /> : null}
    </Flex>
  )
}
