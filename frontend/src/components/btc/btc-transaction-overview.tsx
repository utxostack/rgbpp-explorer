import type { I18n } from '@lingui/core'
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

export function BtcTransactionOverview({ btcTransaction, i18n }: { btcTransaction: BitcoinTransaction; i18n: I18n }) {
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
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overview`}</Heading>
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
          <OverviewInfoItem label={t(i18n)`Block Height`}>
            <Link
              href={`/block/btc/${btcTransaction.blockHash}`}
              color="brand"
              _hover={{ textDecoration: 'underline' }}
            >
              {formatNumber(btcTransaction?.blockHeight)}
            </Link>
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`Size`}>
            <OverflowAmount amount={formatNumber(btcTransaction.size)} symbol={t(i18n)`bytes`} />
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t(i18n)`Fee`}>
            <OverflowAmount amount={formatNumber(btcTransaction.fee)} symbol={t(i18n)`sats`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`Fee rate`}>
            <OverflowAmount amount={formatNumber(btcTransaction.feeRate)} symbol={t(i18n)`sat/VB`} />
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
