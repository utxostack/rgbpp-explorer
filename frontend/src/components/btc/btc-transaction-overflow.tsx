import { t } from '@lingui/macro'

import { BtcTransaction } from '@/apis/types/explorer-graphql'
import OverflowSVG from '@/assets/overview.svg'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

import { Grid, HStack, VStack } from 'styled-system/jsx'

export function BtcTransactionOverflow({ btcTransaction }: { btcTransaction: BtcTransaction }) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overflow`}</Heading>
        {btcTransaction.locktime ? <TimeFormatter timestamp={btcTransaction.locktime} /> : null}
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
            <Link
              href={`/block/btc/${btcTransaction.blockHash}`}
              color="brand"
              _hover={{ textDecoration: 'underline' }}
            >
              {formatNumber(btcTransaction.blockHeight)}
            </Link>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Size`}</Text>
            <Text>
              {formatNumber(btcTransaction.size)}{' '}
              <Text as="span" color="12px">
                {t(i18n)`bytes`}
              </Text>
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
              {formatNumber(btcTransaction.fee)}{' '}
              <Text as="span" color="12px">
                {t(i18n)`sats`}
              </Text>
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee rate`}</Text>
            <Text>
              {btcTransaction.feeRate}{' '}
              <Text as="span" color="12px">
                {t(i18n)`sat/VB`}
              </Text>
            </Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
