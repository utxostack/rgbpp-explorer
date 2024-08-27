import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import BtcIcon from '@/assets/chains/btc.svg'
import SpeedDropIcon from '@/assets/speed/drop.svg'
import SpeedHighIcon from '@/assets/speed/high.svg'
import SpeedLowIcon from '@/assets/speed/low.svg'
import SpeedMediumIcon from '@/assets/speed/medium.svg'
import {
  OverviewInfo,
  OverviewInfoGrid,
  OverviewInfoItem,
  OverviewInfoTagLabel,
  splitLineBefore,
} from '@/components/overview-info'
import { Heading } from '@/components/ui'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

export async function Info() {
  const i18n = getI18nFromHeaders()
  const { btcChainInfo, rgbppStatistic } = await graphQLClient.request(
    graphql(`
      query BtcChainInfo {
        btcChainInfo {
          tipBlockHeight
          tipBlockHash
          difficulty
          transactionsCountIn24Hours
          fees {
            fastest
            halfHour
            hour
            economy
            minimum
          }
        }
        rgbppStatistic {
          latest24HoursL1TransactionsCount
        }
      }
    `),
  )

  return (
    <VStack gridColumn="1/3" gap="20px" bg="bg.card" p={{ base: '20px', md: '30px' }} alignItems="start" rounded="8px">
      <HStack gap="16px">
        <BtcIcon w="48px" h="48px" />
        <Heading fontSize="20px" fontWeight="bold">{t(i18n)`Bitcoin`}</Heading>
      </HStack>
      <Grid w="100%" gridTemplateColumns={{ base: '1fr', xl: 'repeat(2, 1fr)' }} gap={{ base: '20px', md: '30px' }}>
        <OverviewInfo>
          <OverviewInfoItem label={t(i18n)`Block Height`} formatNumber>
            {btcChainInfo.tipBlockHeight}
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`L1 RGB++ Txns(24H)`} formatNumber>
            {rgbppStatistic.latest24HoursL1TransactionsCount}
          </OverviewInfoItem>
          <OverviewInfoItem label={t(i18n)`RGB++ Assets Holders`} unsupported />
        </OverviewInfo>
        <OverviewInfoGrid
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          rowGap="35px"
          css={{
            '& > div:not(:last-child)': {
              pos: 'relative',
              _before: { ...splitLineBefore, content: '" "' },
            },
            '& > div:nth-child(even):not(:last-child)': {
              pos: 'relative',
              _before: {
                ...splitLineBefore,
                content: { base: 'unset', md: '" "' },
              },
            },
          }}
        >
          <OverviewInfoItem
            formatNumber
            unit={t(i18n)`sats/kB`}
            direction="column"
            label={
              <OverviewInfoTagLabel bg="danger.a10" color="danger" icon={<SpeedHighIcon />} mx="auto">
                {t(i18n)`High`}
              </OverviewInfoTagLabel>
            }
          >
            {btcChainInfo.fees.fastest}
          </OverviewInfoItem>
          <OverviewInfoItem
            formatNumber
            direction="column"
            unit={t(i18n)`sats/kB`}
            label={
              <OverviewInfoTagLabel bg="warning.a10" color="warning" icon={<SpeedMediumIcon />} mx="auto">
                {t(i18n)`Medium`}
              </OverviewInfoTagLabel>
            }
          >
            {btcChainInfo.fees.halfHour}
          </OverviewInfoItem>
          <OverviewInfoItem
            formatNumber
            unit={t(i18n)`sats/kB`}
            direction="column"
            label={
              <OverviewInfoTagLabel bg="success.a10" color="success" icon={<SpeedLowIcon />} mx="auto">
                {t(i18n)`Low`}
              </OverviewInfoTagLabel>
            }
          >
            {btcChainInfo.fees.economy}
          </OverviewInfoItem>
          <OverviewInfoItem
            formatNumber
            unit={t(i18n)`sats/kB`}
            direction="column"
            label={
              <OverviewInfoTagLabel bg="brand.a10" color="brand" icon={<SpeedDropIcon />} mx="auto">
                {t(i18n)`Drop`}
              </OverviewInfoTagLabel>
            }
          >
            {btcChainInfo.fees.minimum}
          </OverviewInfoItem>
        </OverviewInfoGrid>
      </Grid>
    </VStack>
  )
}
