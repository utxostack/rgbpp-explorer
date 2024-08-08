'use client'

import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { sum } from 'lodash-es'
import { Flex } from 'styled-system/jsx'

import MoneyIcon from '@/assets/money.svg'
import { BitcoinOutput } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { formatNumber } from '@/lib/string/format-number'

export function BtcOutputsSum({ vout = [] }: { vout?: BitcoinOutput[] }) {
  const balance = sum(vout.map((x) => x.value))
  const diff = satsToBtc(BigNumber(balance))

  return !diff.isZero() ? (
    <Flex align="center" bg="brand" py="8px" px="16px" rounded="4px">
      <Trans>{formatNumber(diff)} BTC</Trans>
      <MoneyIcon w="16px" h="16px" ml="6px" />
    </Flex>
  ) : null
}
