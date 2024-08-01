import { t, Trans } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import { CkbBlock } from '@/apis/types/explorer-graphql'
import OverflowSVG from '@/assets/overview.svg'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text } from '@/components/ui'
import { formatCkbAddress } from '@/lib/address/format-ckb-address'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export function CkbBlockOverflow({
  block,
}: {
  block: Pick<CkbBlock, 'timestamp' | 'transactionsCount' | 'miner' | 'reward'>
}) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overflow`}</Heading>
        {block.timestamp ? <TimeFormatter timestamp={block.timestamp} /> : null}
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Block size`}</Text>
            <Text color="brand">
              {'- '}
              <Text as="span" color="12px">
                {t(i18n)`bytes`}
              </Text>
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Transaction`}</Text>
            <Text>{formatNumber(block.transactionsCount)} </Text>
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
            <Text color="text.third" fontSize="14px">{t(i18n)`Miner`}</Text>
            <Text whiteSpace="nowrap" maxW="250px" truncate color="brand">
              {formatCkbAddress(block.miner.address)}
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Minter Reward`}</Text>
            <Text>
              {formatNumber(shannonToCKB(block.reward))}
              <Text as="span" fontSize="12px" ml="4px">
                <Trans>CKB</Trans>
              </Text>
            </Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
