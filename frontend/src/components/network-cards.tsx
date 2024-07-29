'use client'

import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Box, Grid, HStack, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import ArrowIcon from '@/assets/arrow.svg'
import BchIcon from '@/assets/chains/bch.svg'
import BsvIcon from '@/assets/chains/bsv.svg'
import BtcIcon from '@/assets/chains/btc.svg'
import CkbIcon from '@/assets/chains/ckb.svg'
import UtxoStackIcon from '@/assets/chains/utxo-stack.svg'
import Link from '@/components/ui/link'
import { Text } from '@/components/ui/primitives/text'
import { QueryKey } from '@/constants/query-key'
import { formatNumber } from '@/lib/string/format-number'

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
  const { data } = useQuery({
    queryKey: [QueryKey.BlockHeightAndTxns24H],
    async queryFn() {
      return explorerGraphql.getBlockHeightAndTxns24H()
    },
    refetchInterval: 10000,
  })

  return (
    <Grid w="100%" gridTemplateColumns="repeat(3, 1fr)">
      <Link
        href="/explorer/btc"
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
            {t`Bitcoin`}
          </Text>
          <ArrowIcon ml="auto" w="28px" />
        </HStack>
        <FieldGroup
          fields={[
            {
              label: t`Block Height`,
              value: formatNumber(data?.btcChainInfo?.tipBlockHeight),
            },
            {
              label: t`Txns(24H)`,
              value: <Text opacity={0.6}>{t`Coming Soon`}</Text>,
            },
          ]}
        />
      </Link>
      <Link
        href="/explorer/ckb"
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
            {t`CKB`}
          </Text>
          <ArrowIcon ml="auto" w="28px" />
        </HStack>
        <FieldGroup
          fields={[
            {
              label: t`Block Height`,
              value: formatNumber(data?.ckbChainInfo?.tipBlockNumber),
            },
            {
              label: t`Txns(24H)`,
              value: <Text opacity={0.6}>{t`Coming Soon`}</Text>,
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
