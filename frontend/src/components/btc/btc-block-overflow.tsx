import { t } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import { BtcBlock } from '@/apis/types/explorer-graphql'
import OverflowSVG from '@/assets/overview.svg'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export function BtcBlockOverflow({
  block,
}: {
  block: Pick<BtcBlock, 'timestamp' | 'size' | 'txCount' | 'feeRateRange' | 'totalFee' | 'miner' | 'height'>
}) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overflow`}</Heading>
        {block.timestamp ? <TimeFormatter timestamp={block.timestamp} /> : null}
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px" pt="20px" pb="30px" px="30px">
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Block size`}</Text>
            <Text color="brand">
              {formatNumber(block.size)}
              <Text as="span" color="12px">
                {t(i18n)`bytes`}
              </Text>
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Transaction`}</Text>
            <Text>{formatNumber(block.txCount)} </Text>
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee rate span`}</Text>
            <Text whiteSpace="nowrap" maxW="250px" truncate>
              {formatNumber(block.feeRateRange.min)}
              <Text as="span" color="12px">
                {t(i18n)`sats/VB`}
              </Text>
              ~ {formatNumber(BigNumber(block.feeRateRange.max))}{' '}
              <Text as="span" color="12px">
                {t(i18n)`sats/VB`}
              </Text>
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Minter`}</Text>
            <Text color="brand">{truncateMiddle(block.miner.address, 5, 5)}</Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
