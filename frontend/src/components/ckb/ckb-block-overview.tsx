import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverflowSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { OverviewInfo, OverviewInfoItem } from '@/components/overview-info'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { CkbBlock } from '@/gql/graphql'
import { formatCkbAddress } from '@/lib/address/format-ckb-address'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export function CkbBlockOverview({
  block,
}: {
  block: Pick<CkbBlock, 'timestamp' | 'transactionsCount' | 'miner' | 'reward' | 'size' | 'confirmations'>
}) {
  if (!block) return null
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overview`}</Heading>
        {block.timestamp ? <TimeFormatter timestamp={block.timestamp} /> : null}
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
          <OverviewInfoItem label={t(i18n)`Miner`}>
            {block.miner ? (
              <Link
                href={`/address/${block.miner.address}`}
                whiteSpace="nowrap"
                maxW="250px"
                truncate
                color="brand"
                _hover={{ textDecoration: 'underline' }}
                cursor="pointer"
              >
                {formatCkbAddress(block.miner.address)}
              </Link>
            ) : (
              <Text color="text.third">-</Text>
            )}
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`Miner Reward`} formatNumber>
            <OverflowAmount amount={formatNumber(block.reward)} symbol={t(i18n)`CKB`} />
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
