import { t } from '@lingui/macro'
import { ReactNode } from 'react'
import { Box, Grid, HStack, VStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import ArrowIcon from '@/assets/arrow.svg'
import BchIcon from '@/assets/chains/bch.svg'
import BsvIcon from '@/assets/chains/bsv.svg'
import BtcIcon from '@/assets/chains/btc.svg'
import CkbIcon from '@/assets/chains/ckb.svg'
import UtxoStackIcon from '@/assets/chains/utxo-stack.svg'
import Link from '@/components/ui/link'
import { Text } from '@/components/ui/primitives/text'

function FieldGroup({ fields }: { fields: Array<{ label: ReactNode; value: ReactNode }> }) {
  return (
    <VStack gap="16px" fontSize="14px" lineHeight="18px" w="100%">
      {fields.map((field, i) => (
        <HStack key={i} justify="space-between" w="100%">
          <Box color="text.third">{field.label}</Box>
          <Box>{field.value}</Box>
        </HStack>
      ))}
    </VStack>
  )
}

export function NetworkCards() {
  const i18n = getI18nFromHeaders()
  return (
    <Grid w="100%" gridTemplateColumns="repeat(3, 1fr)">
      <Link
        href="/"
        display="flex"
        alignItems="start"
        flexDir="column"
        justifyContent="space-between"
        gap="36px"
        bg="bg.card"
        _hover={{ bg: 'bg.card.hover' }}
        transition="200ms"
        rounded="8px"
        p="30px"
      >
        <HStack gap="16px" w="100%">
          <BtcIcon w="48px" />
          <Text fontSize="22px" fontWeight="bold">
            {t(i18n)`Bitcoin`}
          </Text>
          <ArrowIcon ml="auto" w="28px" />
        </HStack>
        <FieldGroup
          fields={[
            {
              label: t(i18n)`Block Height`,
              value: (10000000).toLocaleString(),
            },
            {
              label: t(i18n)`Txns(24H)`,
              value: (10000000).toLocaleString(),
            },
          ]}
        />
      </Link>
      <Link
        href="/"
        display="flex"
        flexDir="column"
        justifyContent="space-between"
        alignItems="start"
        gap="36px"
        bg="bg.card"
        _hover={{ bg: 'bg.card.hover' }}
        transition="200ms"
        rounded="8px"
        p="30px"
      >
        <HStack gap="16px" w="100%">
          <CkbIcon w="48px" />
          <Text fontSize="22px" fontWeight="bold">
            {t(i18n)`CKB`}
          </Text>
          <ArrowIcon ml="auto" w="28px" />
        </HStack>
        <FieldGroup
          fields={[
            {
              label: t(i18n)`Block Height`,
              value: (10000000).toLocaleString(),
            },
            {
              label: t(i18n)`Txns(24H)`,
              value: (10000000).toLocaleString(),
            },
          ]}
        />
      </Link>
      <VStack gap="40px" bg="bg.card" rounded="8px" p="30px" opacity={0.5} fontSize="14px">
        <HStack gap="24px" fontWeight="semibold" w="100%" justify="center">
          <HStack>
            <BsvIcon w="32px" h="32px" />
            <Text>BSV</Text>
          </HStack>
          <HStack>
            <BchIcon w="32px" h="32px" />
            <Text>BCH</Text>
          </HStack>
          <HStack>
            <UtxoStackIcon w="32px" h="32px" />
            <Text>Utxo Stack</Text>
          </HStack>
        </HStack>
        <Box fontWeight="semibold" py="10px" px="40px" rounded="100px" bg="bg.input" mx="auto">
          Coming
        </Box>
      </VStack>
    </Grid>
  )
}
