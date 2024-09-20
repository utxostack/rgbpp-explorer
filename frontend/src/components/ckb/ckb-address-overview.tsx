'use client'

import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverviewSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { OverviewInfo, OverviewInfoItem } from '@/components/overview-info'
import { Heading } from '@/components/ui'
import { CkbAddressBaseQuery } from '@/gql/graphql'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { formatNumber } from '@/lib/string/format-number'

export function CkbAddressOverview({ ckbAddress }: { ckbAddress: CkbAddressBaseQuery['ckbAddress'] }) {
  if (!ckbAddress) return null
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
          <OverviewInfoItem label={t`CKB Balance`}>
            <OverflowAmount amount={formatNumber(shannonToCKB(ckbAddress.balance?.total))} symbol={t`CKB`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Available`}>
            <OverflowAmount amount={formatNumber(shannonToCKB(ckbAddress.balance?.available))} symbol={t`CKB`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Occupied`}>
            <OverflowAmount amount={formatNumber(shannonToCKB(ckbAddress.balance?.occupied))} symbol={t`CKB`} />
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t`Txns`} formatNumber>
            {ckbAddress.transactionsCount}
          </OverviewInfoItem>
          <OverviewInfoItem label={t`L2 RGB++ Assets`} unsupported />
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
