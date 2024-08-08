import { t } from '@lingui/macro'
import { Box, Grid, VStack } from 'styled-system/jsx'

import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { formatNumber } from '@/lib/string/format-number'

export async function HomeQuickInfo() {
  const i18n = getI18nFromHeaders()
  const { rgbppStatistic } = await graphQLClient
    .request(
      graphql(`
        query RgbppStatistic {
          rgbppStatistic {
            transactionsCount
            holdersCount
          }
        }
      `),
    )
    .catch(() => ({ rgbppStatistic: { transactionsCount: undefined, holdersCount: undefined } }))

  return (
    <Grid
      rounded="200px"
      border="1px solid rgba(255, 255, 255, 0.6)"
      gridTemplateColumns="1fr 1fr"
      p="20px"
      backdropFilter="blur(16.5px)"
      bg="rgba(0, 0, 0, 0.4)"
      w="580px"
    >
      <VStack gap="2px" borderRight="2px solid" borderColor="rgba(255, 255, 255, 0.1)">
        <Box fontSize="36px" lineHeight="100%" fontWeight="bold">
          {formatNumber(rgbppStatistic.transactionsCount)}
        </Box>
        <Box fontSize="sm" lineHeight="20px" color="text.third" fontWeight="semibold">
          {t(i18n)`RGB++ Txns`}
        </Box>
      </VStack>
      <VStack gap="2px">
        <Box fontSize="36px" lineHeight="100%" fontWeight="bold">
          {formatNumber(rgbppStatistic.holdersCount)}
        </Box>
        <Box fontSize="sm" lineHeight="20px" color="text.third" fontWeight="semibold">
          {t(i18n)`RGB++ Assets Holders`}
        </Box>
      </VStack>
    </Grid>
  )
}
