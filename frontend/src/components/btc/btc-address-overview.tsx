import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { Heading, Text } from '@/components/ui'
import { BtcAddressBaseQuery } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export function BtcAddressOverview({ btcAddress }: { btcAddress: BtcAddressBaseQuery['btcAddress'] }) {
  if (!btcAddress) return null
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverviewSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overview`}</Heading>
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px" pt="20px" pb="30px" px="30px" textAlign="center">
        <Grid
          gridTemplateColumns="repeat(3, 1fr)"
          px="20px"
          py="25px"
          bg="bg.card.hover"
          rounded="8px"
          fontSize="20px"
          lineHeight="100%"
        >
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`BTC Balance`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(satsToBtc(btcAddress.satoshi))} symbol={t(i18n)`BTC`} />
            </Text>
          </VStack>
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Confirmed`}</Text>
            <Text>
              <OverflowAmount
                amount={formatNumber(satsToBtc(btcAddress.satoshi).minus(btcAddress.pendingSatoshi))}
                symbol={t(i18n)`BTC`}
              />
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Unconfirmed`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(satsToBtc(btcAddress.pendingSatoshi))} symbol={t(i18n)`BTC`} />
            </Text>
          </VStack>
        </Grid>
        <Grid
          gridTemplateColumns="repeat(2, 1fr)"
          px="20px"
          py="25px"
          bg="bg.card.hover"
          rounded="8px"
          fontSize="20px"
          lineHeight="100%"
        >
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Txns`}</Text>
            <Text>{formatNumber(btcAddress.transactionsCount ?? undefined)}</Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`L1 RGB++ Assets`}</Text>
            <Text color="text.third">{t(i18n)`Coming Soon`}</Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
