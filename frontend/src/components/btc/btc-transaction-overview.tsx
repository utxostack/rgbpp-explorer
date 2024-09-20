'use client'

import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { OverviewInfo, OverviewInfoItem } from '@/components/overview-info'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading } from '@/components/ui'
import Link from '@/components/ui/link'
import { BitcoinTransaction } from '@/gql/graphql'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'
import { formatNumber } from '@/lib/string/format-number'

export function BtcTransactionOverview({ btcTransaction }: { btcTransaction: BitcoinTransaction }) {
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack
        w="100%"
        px={{ base: '20px', xl: '30px' }}
        py="16px"
        gap="12px"
        borderBottom="1px solid"
        borderBottomColor="border.primary"
      >
        <OverviewSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t`Overview`}</Heading>
        {btcTransaction.transactionTime ? (
          <TimeFormatter timestamp={resolveBtcTime(btcTransaction.transactionTime)} />
        ) : null}
      </HStack>
      <Grid
        w="100%"
        gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
        gap={{ base: '20px', md: '30px' }}
        pt="20px"
        pb={{ base: '20px', md: '30px' }}
        px={{ base: '20px', md: '30px' }}
        textAlign="center"
      >
        <OverviewInfo>
          <OverviewInfoItem label={t`Block Height`}>
            <Link
              href={`/block/btc/${btcTransaction.blockHash}`}
              color="brand"
              _hover={{ textDecoration: 'underline' }}
            >
              {formatNumber(btcTransaction?.blockHeight)}
            </Link>
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Size`}>
            <OverflowAmount amount={formatNumber(btcTransaction.size)} symbol={t`bytes`} />
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t`Fee`}>
            <OverflowAmount amount={formatNumber(btcTransaction.fee)} symbol={t`sats`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Fee rate`}>
            <OverflowAmount amount={formatNumber(btcTransaction.feeRate)} symbol={t`sat/VB`} />
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
