import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import BtcIcon from '@/assets/chains/btc.svg'
import SpeedDropIcon from '@/assets/speed/drop.svg'
import SpeedHighIcon from '@/assets/speed/high.svg'
import SpeedLowIcon from '@/assets/speed/low.svg'
import SpeedMediumIcon from '@/assets/speed/medium.svg'
import { Heading, Text } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export async function Info() {
  const i18n = getI18nFromHeaders()
  const { btcChainInfo, rgbppStatistic } = await explorerGraphql.getBtcChainInfo()
  return (
    <VStack gridColumn="1/3" gap="20px" bg="bg.card" p="30px" alignItems="start" rounded="8px">
      <HStack gap="16px">
        <BtcIcon w="48px" h="48px" />
        <Heading fontSize="20px" fontWeight="bold">{t(i18n)`Bitcoin`}</Heading>
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px">
        <Grid
          gridTemplateColumns="repeat(3, 1fr)"
          px="20px"
          py="25px"
          bg="bg.card.hover"
          rounded="8px"
          fontSize="20px"
          lineHeight="100%"
        >
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Block Height`}</Text>
            <Text>{formatNumber(btcChainInfo.tipBlockHeight)}</Text>
          </VStack>
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`L1 RGB++ Txns(24H)`}</Text>
            <Text>{formatNumber(btcChainInfo.transactionsCountIn24Hours)}</Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`RGB++ Assets Holders`}</Text>
            <Text>{formatNumber(rgbppStatistic.holdersCount)}</Text>
          </VStack>
        </Grid>
        <Grid gridTemplateColumns="repeat(4, 1fr)" bg="bg.card.hover" px="20px" pb="25px" pt="30px" rounded="8px">
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <HStack bg="danger.a10" px="10px" rounded="4px" color="danger" gap="4px" lineHeight="24px">
              <SpeedHighIcon w="20px" h="20px" />
              <Text fontSize="14px" fontWeight="semibold">{t(i18n)`High`}</Text>
            </HStack>
            <Text>
              {formatNumber(btcChainInfo.fees.fastest)}
              <Text as="span" color="text.third" fontSize="12px" ml="4px">
                {t(i18n)`sats/kB`}
              </Text>
            </Text>
          </VStack>
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <HStack bg="warning.a10" px="10px" rounded="4px" color="warning" gap="4px" lineHeight="24px">
              <SpeedMediumIcon w="20px" h="20px" />
              <Text fontSize="14px" fontWeight="semibold">{t(i18n)`Medium`}</Text>
            </HStack>
            <Text>
              {formatNumber(btcChainInfo.fees.halfHour)}
              <Text as="span" color="text.third" fontSize="12px" ml="4px">
                {t(i18n)`sats/kB`}
              </Text>
            </Text>
          </VStack>
          <VStack borderRight="1px solid" borderRightColor="border.primary" gap="15px">
            <HStack bg="success.a10" px="10px" rounded="4px" color="success" gap="4px" lineHeight="24px">
              <SpeedLowIcon w="20px" h="20px" />
              <Text fontSize="14px" fontWeight="semibold">{t(i18n)`Low`}</Text>
            </HStack>
            <Text>
              {formatNumber(btcChainInfo.fees.economy)}
              <Text as="span" color="text.third" fontSize="12px" ml="4px">
                {t(i18n)`sats/kB`}
              </Text>
            </Text>
          </VStack>
          <VStack gap="15px">
            <HStack bg="brand.a10" px="10px" rounded="4px" color="brand" gap="4px" lineHeight="24px">
              <SpeedDropIcon w="20px" h="20px" />
              <Text fontSize="14px" fontWeight="semibold">{t(i18n)`Drop`}</Text>
            </HStack>
            <Text>
              {formatNumber(btcChainInfo.fees.minimum)}
              <Text as="span" color="text.third" fontSize="12px" ml="4px">
                {t(i18n)`sats/kB`}
              </Text>
            </Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
