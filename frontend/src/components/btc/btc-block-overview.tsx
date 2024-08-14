import { t } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { TextOverflowTooltip } from '@/components/text-overflow-tooltip'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text, Tooltip } from '@/components/ui'
import Link from '@/components/ui/link'
import { BitcoinBlock } from '@/gql/graphql'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export function BtcBlockOverview({
  block,
}: {
  block: Pick<
    BitcoinBlock,
    'timestamp' | 'size' | 'transactionsCount' | 'feeRateRange' | 'totalFee' | 'miner' | 'height'
  >
}) {
  if (!block) return null
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverviewSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overview`}</Heading>
        {block.timestamp ? <TimeFormatter timestamp={resolveBtcTime(block.timestamp)} /> : null}
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Block size`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(block.size)} symbol={t(i18n)`bytes`} />
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Transaction`}</Text>
            <Text>{formatNumber(block.transactionsCount)} </Text>
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
            <TextOverflowTooltip
              label={
                <Text whiteSpace="nowrap">
                  {t(
                    i18n,
                  )`${formatNumber(block.feeRateRange?.min ?? 0)} sats/VB ~ ${formatNumber(BigNumber(block.feeRateRange?.max ?? 0))} sats/VB`}
                </Text>
              }
              contentProps={{ maxW: 'unset' }}
            >
              <Text whiteSpace="nowrap" maxW="250px" truncate>
                {formatNumber(block.feeRateRange?.min ?? 0)}
                <Text as="span" fontSize="14px" ml="4px">
                  {t(i18n)`sats/VB`}
                </Text>
                {' ~ '}
                {formatNumber(BigNumber(block.feeRateRange?.max ?? 0))}{' '}
                <Text as="span" fontSize="14px">
                  {t(i18n)`sats/VB`}
                </Text>
              </Text>
            </TextOverflowTooltip>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Miner`}</Text>
            {block.miner ? (
              <Tooltip.Root openDelay={0} closeDelay={0}>
                <Tooltip.Trigger>
                  <Link
                    href={`/address/${block.miner.address}`}
                    color="brand"
                    _hover={{
                      textDecoration: 'underline',
                    }}
                  >
                    {truncateMiddle(block.miner.address, 5, 5)}
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                  <Tooltip.Content whiteSpace="nowrap" maxW="unset">
                    {block.miner.address}
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            ) : (
              <Text color="text.third">-</Text>
            )}
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
