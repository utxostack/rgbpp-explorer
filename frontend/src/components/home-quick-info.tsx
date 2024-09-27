import type { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { sum } from 'lodash-es'
import { Box, Grid, VStack } from 'styled-system/jsx'

import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'
import { formatNumber } from '@/lib/string/format-number'

export async function HomeQuickInfo({ i18n }: { i18n: I18n }) {
  const { rgbppStatistic } = await graphQLClient
    .request(
      graphql(`
        query RgbppStatistic {
          rgbppStatistic {
            l1HoldersCount: holdersCount(layer: L1)
            l2HoldersCount: holdersCount(layer: L2)
            latest24HoursL2TransactionsCount
            latest24HoursL1TransactionsCountLeapIn: latest24HoursL1TransactionsCount(leapDirection: LeapIn)
            latest24HoursL1TransactionsCountLeapOutput: latest24HoursL1TransactionsCount(leapDirection: LeapOut)
            latest24HoursL1TransactionsCountLeapWithin: latest24HoursL1TransactionsCount(leapDirection: Within)
          }
        }
      `),
    )
    .catch(() => ({ rgbppStatistic: null }))
  const transactionsCount = formatNumber(
    rgbppStatistic
      ? sum([
          rgbppStatistic.latest24HoursL1TransactionsCountLeapIn,
          rgbppStatistic.latest24HoursL1TransactionsCountLeapOutput,
          rgbppStatistic.latest24HoursL1TransactionsCountLeapWithin,
        ])
      : undefined,
  )

  const holdersCount = formatNumber(
    rgbppStatistic ? sum([rgbppStatistic.l1HoldersCount, rgbppStatistic.l2HoldersCount]) : undefined,
  )

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
        <Box>{transactionsCount}</Box>
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
        <Box>{holdersCount}</Box>
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
