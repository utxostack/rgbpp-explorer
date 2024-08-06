import { t } from '@lingui/macro'
import { Grid, HStack, VStack } from 'styled-system/jsx'

import OverflowSVG from '@/assets/overview.svg'
import { OverflowAmount } from '@/components/overflow-amount'
import { TimeFormatter } from '@/components/time-formatter'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { CkbTransaction } from '@/gql/graphql'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export function CkbTransactionOverview({ ckbTransaction }: { ckbTransaction: CkbTransaction }) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap={0} w="100%" bg="bg.card" rounded="8px">
      <HStack w="100%" px="30px" py="16px" gap="12px" borderBottom="1px solid" borderBottomColor="border.primary">
        <OverflowSVG w="24px" />
        <Heading fontSize="16px" fontWeight="semibold">{t(i18n)`Overview`}</Heading>
        {ckbTransaction.block?.timestamp ? <TimeFormatter timestamp={ckbTransaction.block.timestamp} /> : null}
      </HStack>
      <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="30px" pt="20px" pb="30px" px="30px" textAlign="center">
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
            <Link
              href={`/block/ckb/${ckbTransaction.block?.hash || ckbTransaction.blockNumber}`}
              color="brand"
              _hover={{ textDecoration: 'underline' }}
            >
              {formatNumber(ckbTransaction.blockNumber)}
            </Link>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Size`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(ckbTransaction.size)} symbol={t(i18n)`bytes`} />
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
              <OverflowAmount amount={formatNumber(shannonToCKB(ckbTransaction.fee))} symbol={t(i18n)`CKB`} />
            </Text>
          </VStack>
          <VStack gap="15px">
            <Text color="text.third" fontSize="14px">{t(i18n)`Fee rate`}</Text>
            <Text>
              <OverflowAmount amount={formatNumber(ckbTransaction.feeRate)} symbol={t(i18n)`shannons/kB`} />
            </Text>
          </VStack>
        </Grid>
      </Grid>
    </VStack>
  )
}
