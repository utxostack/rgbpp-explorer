import { t } from '@lingui/macro'
import dayjs from 'dayjs'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import OverflowSVG from '@/assets/overview.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Heading, Text } from '@/components/ui'
import { TIME_TEMPLATE } from '@/constants'

export function Overflow() {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overflow`}</Heading>
        <HStack fontSize="14px" fontWeight="medium" ml="auto">
          {dayjs('2024-07-11 10:47:22').format(TIME_TEMPLATE)}
          <Text color="text.third">
            (<AgoTimeFormatter time="2024-07-11 10:47:22" />)
          </Text>
        </HStack>
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px" pt="20px" pb="30px" px="30px">
        <Grid
          gridTemplateColumns="repeat(2, 1fr)"
          px="20px"
          py="25px"
          bg="bg.card.hover"
          rounded="8px"
          fontSize="20px"
          lineHeight="100%"
        >
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Block Height`}</Text>
            <Text color="brand">{(10000000).toLocaleString()}</Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Size`}</Text>
            <Text>
              {(10000000).toLocaleString()}{' '}
              <Text as="span" color="12px">
                {t(i18n)`bytes`}
              </Text>
            </Text>
          </VStack>
        </Grid>
        <Grid
          gridTemplateColumns="repeat(2, 1fr)"
          px="20px"
          py="25px"
          bg="bg.card.hover"
          rounded="8px"
          fontSize="20px"
          lineHeight="100%"
        >
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee`}</Text>
            <Text>
              {(500).toLocaleString()}{' '}
              <Text as="span" color="12px">
                {t(i18n)`sats`}
              </Text>
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee rate`}</Text>
            <Text>
              {(50).toLocaleString()}{' '}
              <Text as="span" color="12px">
                {t(i18n)`sat/VB`}
              </Text>
            </Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
