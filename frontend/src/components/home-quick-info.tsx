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
      px="20px"
      py={{ base: '8px', md: '16px', xl: '20px' }}
      backdropFilter="blur(16.5px)"
      bg="rgba(0, 0, 0, 0.4)"
      w={{ base: '275px', md: '400px', xl: '580px' }}
      fontSize={{ base: '20px', md: '30px', xl: '36px' }}
      lineHeight={{ base: '30px', md: '38px', xl: '100%' }}
      fontWeight="bold"
    >
      <VStack gap="2px" borderRight="2px solid" borderColor="rgba(255, 255, 255, 0.1)">
        <Box>{formatNumber(rgbppStatistic.transactionsCount)}</Box>
        <Box
          fontSize={{ base: '12px', md: '14px' }}
          lineHeight={{ base: '16px', md: '20px' }}
          color="text.third"
          fontWeight={{ base: 'medium', xl: 'semibold' }}
        >
          {t(i18n)`RGB++ Txns`}
        </Box>
      </VStack>
      <VStack gap="2px">
        <Box>{formatNumber(rgbppStatistic.holdersCount)}</Box>
        <Box
          fontSize={{ base: '12px', md: '14px' }}
          lineHeight={{ base: '16px', md: '20px' }}
          color="text.third"
          fontWeight={{ base: 'medium', xl: 'semibold' }}
        >
          {t(i18n)`RGB++ Holders`}
        </Box>
      </VStack>
    </Grid>
  )
}
