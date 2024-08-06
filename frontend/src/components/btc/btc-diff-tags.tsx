import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { compact, sum } from 'lodash-es'
import { Flex } from 'styled-system/jsx'

import MoneyIcon from '@/assets/money.svg'
import { BitcoinInput, BitcoinOutput } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { formatNumber } from '@/lib/string/format-number'

export function BtcDiffTags({
  vin = [],
  vout = [],
  address,
}: {
  vin?: BitcoinInput[]
  vout?: BitcoinOutput[]
  address: string
}) {
  const inputBalance = sum(
    compact(vin.filter((x) => address === x.prevout?.address?.address).map((x) => x.prevout?.value)),
  )
  const outputBalance = sum(compact(vout.filter((x) => address === x.address?.address).map((x) => x.value)))
  const diff = satsToBtc(BigNumber(outputBalance).minus(BigNumber(inputBalance)))

  return !diff.isZero() ? (
    <Flex align="center" py="8px" px="16px" rounded="4px" bg={diff.isGreaterThan(0) ? 'success' : 'danger'}>
      <Trans>{formatNumber(diff)} BTC</Trans>
      <MoneyIcon w="16px" h="16px" ml="6px" />
    </Flex>
  ) : null
}
