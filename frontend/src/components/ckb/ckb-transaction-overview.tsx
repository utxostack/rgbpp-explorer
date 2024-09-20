'use client'

import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverflowSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { OverviewInfo, OverviewInfoItem } from '@/components/overview-info'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading } from '@/components/ui'
import Link from '@/components/ui/link'
import { CkbTransaction } from '@/gql/graphql'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { formatNumber } from '@/lib/string/format-number'

export function CkbTransactionOverview({ ckbTransaction }: { ckbTransaction: CkbTransaction }) {
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
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t`Overview`}</Heading>
        {ckbTransaction.block?.timestamp ? <TimeFormatter timestamp={ckbTransaction.block.timestamp} /> : null}
      </HStack>
      <Grid
        w="100%"
        gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
        gap={{ base: '20px', md: '30px' }}
        pt="20px"
        pb={{ base: '20px', md: '30px' }}
        px={{ base: '20px', md: '30px' }}
        textAlign="center"
      >
        <OverviewInfo>
          <OverviewInfoItem label={t`Block Height`}>
            <Link
              href={`/block/ckb/${ckbTransaction.block?.hash || ckbTransaction.blockNumber}`}
              color="brand"
              _hover={{ textDecoration: 'underline' }}
            >
              {formatNumber(ckbTransaction.blockNumber)}
            </Link>
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Size`} formatNumber unit={t`bytes`}>
            {ckbTransaction.size}
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem label={t`Fee`}>
            <OverflowAmount amount={formatNumber(shannonToCKB(ckbTransaction.fee))} symbol={t`CKB`} />
          </OverviewInfoItem>
          <OverviewInfoItem label={t`Size`}>
            <OverflowAmount amount={formatNumber(ckbTransaction.feeRate)} symbol={t`shannons/kB`} />
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
