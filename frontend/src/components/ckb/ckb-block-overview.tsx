'use client'

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
import { formatNumber } from '@/lib/string/format-number'

export function CkbBlockOverview({
  block,
}: {
  block: Pick<CkbBlock, 'timestamp' | 'transactionsCount' | 'miner' | 'reward' | 'size' | 'confirmations'>
}) {
  if (!block) return null
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t`Overview`}</Heading>
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
          <OverviewInfoItem label={t`Block size`}>
            <OverflowAmount amount={formatNumber(block.size)} symbol={t`bytes`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Transaction`} formatNumber>
            {block.transactionsCount}
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t`Miner`}>
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
          <OverviewInfoItem label={t`Miner Reward`} formatNumber>
            <OverflowAmount amount={formatNumber(block.reward)} symbol={t`CKB`} />
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
