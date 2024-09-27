import type { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { Box, Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { OverviewInfo, OverviewInfoItem } from '@/components/overview-info'
import { TextOverflowTooltip } from '@/components/text-overflow-tooltip'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text, Tooltip } from '@/components/ui'
import Link from '@/components/ui/link'
import { BitcoinBlock } from '@/gql/graphql'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export function BtcBlockOverview({
  block,
  i18n,
}: {
  block: Pick<
    BitcoinBlock,
    'timestamp' | 'size' | 'transactionsCount' | 'feeRateRange' | 'totalFee' | 'miner' | 'height'
  >
  i18n: I18n
}) {
  if (!block) return null
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
        {block.timestamp ? <TimeFormatter timestamp={resolveBtcTime(block.timestamp)} ml="auto" /> : null}
      </HStack>
      <Grid
        w="100%"
        gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
        gap={{ base: '20px', md: '30px' }}
        pt="20px"
        pb={{ base: '20px', md: '30px' }}
        px={{ base: '20px', xl: '30px' }}
        textAlign="center"
      >
        <OverviewInfo>
          <OverviewInfoItem label={t(i18n)`Block size`}>
            <OverflowAmount amount={formatNumber(block.size)} symbol={t(i18n)`bytes`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`Transaction`} formatNumber>
            {block.transactionsCount}
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t(i18n)`Fee rate span`}>
            <TextOverflowTooltip
              label={
                <Text whiteSpace="nowrap">
                  {t(
                    i18n,
                  )`${formatNumber(block.feeRateRange?.min ?? 0)} sats/VB ~ ${formatNumber(BigNumber(block.feeRateRange?.max ?? 0))} sats/VB`}
                </Text>
              }
              contentProps={{ maxW: 'unset' }}
              positioning={{ placement: 'top' }}
            >
              <Box
                whiteSpace="nowrap"
                minW="0"
                maxW={{ base: '130px', sm: 'unset', md: '250px' }}
                textAlign={{ base: 'right', md: 'center' }}
                truncate
                flex={1}
                ml="auto"
              >
                {formatNumber(block.feeRateRange?.min ?? 0)}
                <Text as="span" fontSize="14px" ml="4px">
                  {t(i18n)`sats/VB`}
                </Text>
                {' ~ '}
                {formatNumber(BigNumber(block.feeRateRange?.max ?? 0))}{' '}
                <Text as="span" fontSize="14px">
                  {t(i18n)`sats/VB`}
                </Text>
              </Box>
            </TextOverflowTooltip>
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`Miner`} formatNumber>
            {block.miner ? (
              <Tooltip.Root openDelay={0} closeDelay={0}>
                <Tooltip.Trigger asChild>
                  <Link
                    href={`/address/${block.miner.address}`}
                    color="brand"
                    textAlign={{ base: 'right', md: 'center' }}
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
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
