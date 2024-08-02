'use client'

import { Trans } from '@lingui/macro'

import { ScriptpubkeyType, Vin, Vout } from '@/apis/types/explorer-graphql'
import SubTractIcon from '@/assets/subtract.svg'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

import { Box, Flex, Grid, HStack, VStack } from '../../../styled-system/jsx'

export interface BtcUtxoTablesProps {
  vin?: Vin[]
  vout?: Vout[]
}

export function BtcUtxoTables({ vin = [], vout = [] }: BtcUtxoTablesProps) {
  return (
    <Grid w="100%" gridTemplateColumns="repeat(2, 1fr)" gap="38px" pt="10px" pb="20px" px="30px">
      <VStack gap={0} w="100%">
        <Heading
          fontSize="14px"
          fontWeight="semibold"
          borderBottom="1px solid"
          borderBottomColor="border.primary"
          w="100%"
          h="60px"
          lineHeight="60px"
        >
          <Trans>Inputs ({vin.length})</Trans>
        </Heading>
        {vin.map((input, i) => (
          <UtxoInput vin={input} key={i} />
        ))}
      </VStack>
      <VStack gap={0}>
        <Heading
          fontSize="14px"
          fontWeight="semibold"
          borderBottom="1px solid"
          borderBottomColor="border.primary"
          w="100%"
          h="60px"
          lineHeight="60px"
        >
          <Trans>Outputs ({vout.length})</Trans>
        </Heading>
        {vout.map((output, i) => (
          <UtxoOutput vout={output} key={i} />
        ))}
      </VStack>
    </Grid>
  )
}

function UtxoInput({ vin }: { vin: Vin }) {
  return (
    <Flex
      justifyContent="space-between"
      w="100%"
      h="60px"
      alignItems="center"
      borderBottom="1px solid"
      borderBottomColor="border.primary"
    >
      <HStack gap="8px">
        <SubTractIcon color={vin.prevout?.status.spent ? 'text.third' : 'success.unspent'} w="16px" h="16px" />
        {vin.prevout ? (
          <Copier onlyIcon value={vin.prevout.address?.address}>
            <Link href={`/address/${vin.prevout.address?.address}`} color="brand" fontSize="14px">
              {truncateMiddle(vin.prevout.address?.address, 10, 10)}
            </Link>
          </Copier>
        ) : null}
      </HStack>
      <VStack gap={0}>
        <Box>
          {formatNumber(satsToBtc(vin.prevout?.value ?? '0'))}{' '}
          <Text as="span" fontSize="12px" color="text.third">
            <Trans>BTC</Trans>
          </Text>
        </Box>
      </VStack>
    </Flex>
  )
}

function UtxoOutput({ vout }: { vout: Vout }) {
  return (
    <Flex
      justifyContent="space-between"
      w="100%"
      h="60px"
      alignItems="center"
      borderBottom="1px solid"
      borderBottomColor="border.primary"
    >
      <HStack gap="8px">
        <SubTractIcon color={vout.status.spent ? 'text.third' : 'success.unspent'} w="16px" h="16px" />
        {vout.scriptpubkeyType === ScriptpubkeyType.OpReturn ? (
          <Trans>OP_RETURN</Trans>
        ) : (
          <Copier onlyIcon value={vout.address?.address}>
            <Link href={`/address/${vout.address?.address}`} color="brand" fontSize="14px">
              {truncateMiddle(vout.address?.address, 10, 10)}
            </Link>
          </Copier>
        )}
      </HStack>
      <VStack gap={0}>
        <Box>
          {formatNumber(satsToBtc(vout.value))}{' '}
          <Text as="span" fontSize="12px" color="text.third">
            <Trans>BTC</Trans>
          </Text>
        </Box>
      </VStack>
    </Flex>
  )
}
