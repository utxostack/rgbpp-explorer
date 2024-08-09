import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { BitcoinTransaction } from '@/gql/graphql'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export function BtcTransactionOverview({ btcTransaction }: { btcTransaction: BitcoinTransaction }) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverviewSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overview`}</Heading>
        {btcTransaction.transactionTime ? (
          <TimeFormatter timestamp={resolveBtcTime(btcTransaction.transactionTime)} />
        ) : null}
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px" pt="20px" pb="30px" px="30px" textAlign="center">
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Block Height`}</Text>
            {btcTransaction.blockHash ? (
              <Link
                href={`/block/btc/${btcTransaction.blockHash}`}
                color="brand"
                _hover={{ textDecoration: 'underline' }}
              >
                {formatNumber(btcTransaction?.blockHeight ?? undefined)}
              </Link>
            ) : (
              '-'
            )}
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Size`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(btcTransaction.size)} symbol={t(i18n)`bytes`} />
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(btcTransaction.fee)} symbol={t(i18n)`sats`} />
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee rate`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(btcTransaction.feeRate)} symbol={t(i18n)`sat/VB`} />
            </Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
