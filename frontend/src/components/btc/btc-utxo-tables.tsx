'use client'

import { Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { Box, Flex, Grid, HStack, VStack } from 'styled-system/jsx'

import SubTractIcon from '@/assets/subtract.svg'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { BitcoinInput, BitcoinOutput } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'
import { ScriptpubkeyType } from '@/types/graphql'

export interface BtcUtxoTablesProps {
  vin?: BitcoinInput[]
  vout?: BitcoinOutput[]
  currentAddress?: string
}

export function BtcUtxoTables({ vin = [], vout = [], currentAddress }: BtcUtxoTablesProps) {
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
          <UtxoInput vin={input} key={i} currentAddress={currentAddress} />
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
          <UtxoOutput vout={output} key={i} currentAddress={currentAddress} />
        ))}
      </VStack>
    </Grid>
  )
}

function UtxoInput({ vin, currentAddress }: { vin: BitcoinInput; currentAddress?: string }) {
  const text = useMemo(() => {
    if (vin.isCoinbase)
      return (
        <Text fontSize="14px" fontWeight="semibold">
          <Trans>Coinbase</Trans>
        </Text>
      )
    if (!vin.prevout) return null
    return (
      <Copier onlyIcon value={vin.prevout.address?.address}>
        {currentAddress === vin.prevout.address?.address ? (
          <Text as="span" color="text.primary">
            {truncateMiddle(currentAddress, 10, 10)}
          </Text>
        ) : (
          <Link href={`/address/${vin.prevout.address?.address}`} color="brand" fontSize="14px">
            {truncateMiddle(vin.prevout.address?.address, 10, 10)}
          </Link>
        )}
      </Copier>
    )
  }, [vin, currentAddress])

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
        <SubTractIcon
          color={vin.isCoinbase || vin.prevout?.status.spent ? 'text.third' : 'success.unspent'}
          w="16px"
          h="16px"
        />
        {text}
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

function UtxoOutput({ vout, currentAddress }: { vout: BitcoinOutput; currentAddress?: string }) {
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
        <SubTractIcon
          color={
            vout.status.spent || vout.scriptpubkeyType === ScriptpubkeyType.OpReturn ? 'text.third' : 'success.unspent'
          }
          w="16px"
          h="16px"
        />
        {vout.scriptpubkeyType === ScriptpubkeyType.OpReturn ? (
          <Trans>OP_RETURN</Trans>
        ) : (
          <Copier onlyIcon value={vout.address?.address}>
            {currentAddress === vout.address?.address ? (
              <Text as="span" color="text.primary">
                {truncateMiddle(currentAddress, 10, 10)}
              </Text>
            ) : (
              <Link href={`/address/${vout.address?.address}`} color="brand" fontSize="14px">
                {truncateMiddle(vout.address?.address, 10, 10)}
              </Link>
            )}
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
