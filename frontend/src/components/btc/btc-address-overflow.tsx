import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import { BtcAddress } from '@/apis/types/explorer-graphql'
import OverflowSVG from '@/assets/overview.svg'
import { Heading, Text } from '@/components/ui'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export function BtcAddressOverflow({ btcAddress }: { btcAddress: BtcAddress }) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overflow`}</Heading>
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px" pt="20px" pb="30px" px="30px">
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
            <Text>{t(i18n)`${formatNumber(satsToBtc(btcAddress.satoshi))} BTC`}</Text>
          </VStack>
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Confirmed`}</Text>
            <Text>
              {formatNumber(satsToBtc(btcAddress.satoshi).minus(btcAddress.pendingSatoshi))} {t(i18n)`BTC`}
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Unconfirmed`}</Text>
            <Text>
              {formatNumber(satsToBtc(btcAddress.pendingSatoshi))} {t(i18n)`BTC`}
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
            <Text color="brand" fontSize="14px">{t(i18n)`Txns`}</Text>
            <Text color="brand">{formatNumber(btcAddress.transactionsCount)}</Text>
          </VStack>
          <VStack gap="15px">
            <Text color="brand" fontSize="14px">{t(i18n)`L1 RGB++ Assets`}</Text>
            <Text color="text.third">{t(i18n)`Coming Soon`}</Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
