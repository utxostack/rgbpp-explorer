'use client'

import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { OverviewInfo, OverviewInfoItem } from '@/components/overview-info'
import { Heading } from '@/components/ui'
import { BtcAddressBaseQuery } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { formatNumber } from '@/lib/string/format-number'

export function BtcAddressOverview({ btcAddress }: { btcAddress: BtcAddressBaseQuery['btcAddress'] }) {
  if (!btcAddress) return null
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverviewSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t`Overview`}</Heading>
      </HStack>
      <Grid
        w="100%"
        gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
        gap={{ base: '20px', xl: '30px' }}
        pt="20px"
        pb={{ base: '20px', xl: '30px' }}
        px={{ base: '20px', xl: '30px' }}
        textAlign="center"
      >
        <OverviewInfo>
          <OverviewInfoItem label={t`BTC Balance`}>
            <OverflowAmount amount={formatNumber(satsToBtc(btcAddress.satoshi))} symbol={t`BTC`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Confirmed`}>
            <OverflowAmount
              amount={formatNumber(satsToBtc(btcAddress.satoshi).minus(btcAddress.pendingSatoshi))}
              symbol={t`BTC`}
            />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Unconfirmed`}>
            <OverflowAmount amount={formatNumber(satsToBtc(btcAddress.pendingSatoshi))} symbol={t`BTC`} />
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t`Txns`} formatNumber>
            {btcAddress.transactionsCount}
          </OverviewInfoItem>
          <OverviewInfoItem label={t`L1 RGB++ Assets`} unsupported />
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
