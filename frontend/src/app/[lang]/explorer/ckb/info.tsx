import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import CkbIcon from '@/assets/chains/ckb.svg'
import SpeedHighIcon from '@/assets/speed/high.svg'
import SpeedLowIcon from '@/assets/speed/low.svg'
import SpeedMediumIcon from '@/assets/speed/medium.svg'
import { OverviewInfo, OverviewInfoItem, OverviewInfoTagLabel } from '@/components/overview-info'
import { Heading } from '@/components/ui'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

export async function Info() {
  const i18n = getI18nFromHeaders()
  const { ckbChainInfo, rgbppStatistic } = await graphQLClient.request(
    graphql(`
      query CkbChainInfo {
        ckbChainInfo {
          tipBlockNumber
          fees {
            fast
            slow
            average
          }
        }
        rgbppStatistic {
          latest24HoursL2TransactionsCount
          holdersCount(layer: L2)
        }
      }
    `),
  )

  return (
    <VStack gridColumn="1/3" gap="20px" bg="bg.card" p={{ base: '20px', md: '30px' }} alignItems="start" rounded="8px">
      <HStack gap="16px">
        <CkbIcon w="48px" h="48px" />
        <Heading fontSize="20px" fontWeight="bold">{t(i18n)`CKB`}</Heading>
      </HStack>
      <Grid w="100%" gridTemplateColumns={{ base: '1fr', xl: 'repeat(2, 1fr)' }} gap={{ base: '20px', md: '30px' }}>
        <OverviewInfo>
          <OverviewInfoItem label={t(i18n)`Block Height`} formatNumber>
            {ckbChainInfo.tipBlockNumber}
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`L2 RGB++ Txns(24H)`} formatNumber>
            {rgbppStatistic.latest24HoursL2TransactionsCount}
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`RGB++ Assets Holders`} formatNumber>
            {rgbppStatistic.holdersCount}
          </OverviewInfoItem>
        </OverviewInfo>
        <OverviewInfo>
          <OverviewInfoItem
            formatNumber
            unit={t(i18n)`shannons/kB`}
            label={
              <OverviewInfoTagLabel bg="danger.a10" color="danger" icon={<SpeedHighIcon />}>
                {t(i18n)`High`}
              </OverviewInfoTagLabel>
            }
          >
            {ckbChainInfo.fees.fast}
          </OverviewInfoItem>
          <OverviewInfoItem
            formatNumber
            unit={t(i18n)`shannons/kB`}
            label={
              <OverviewInfoTagLabel bg="warning.a10" color="warning" icon={<SpeedMediumIcon />}>
                {t(i18n)`Medium`}
              </OverviewInfoTagLabel>
            }
          >
            {ckbChainInfo.fees.average}
          </OverviewInfoItem>
          <OverviewInfoItem
            formatNumber
            unit={t(i18n)`shannons/kB`}
            label={
              <OverviewInfoTagLabel bg="success.a10" color="success" icon={<SpeedLowIcon />}>
                {t(i18n)`Low`}
              </OverviewInfoTagLabel>
            }
          >
            {ckbChainInfo.fees.slow}
          </OverviewInfoItem>
        </OverviewInfo>
      </Grid>
    </VStack>
  )
}
