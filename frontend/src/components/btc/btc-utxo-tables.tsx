'use client'

import { Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { Box, Flex, Grid, HStack, VStack } from 'styled-system/jsx'

import SubTractIcon from '@/assets/subtract.svg'
import { parseRgbppLockArgs } from '@/components/ckb/parse-rgbpp-lock-args'
import { Copier } from '@/components/copier'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { BitcoinInput, BitcoinOutput, CellType, CkbCell, CkbTransaction } from '@/gql/graphql'
import { satsToBtc } from '@/lib/btc/sats-to-btc'
import { isRgbppLockCell } from '@/lib/ckb/is-rgbpp-lock-cell'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'
import { ScriptpubkeyType } from '@/types/graphql'

export interface BtcUtxoTablesProps {
  vin?: BitcoinInput[]
  vout?: BitcoinOutput[]
  currentAddress?: string
  ckbCell?: Pick<CkbTransaction, 'inputs' | 'outputs'>
  txid?: string
}

export function BtcUtxoTables({ txid, vin = [], vout = [], currentAddress, ckbCell }: BtcUtxoTablesProps) {
  return (
    <Grid
      w="100%"
      gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
      gap={{ base: '20px', lg: '38px' }}
      pt="10px"
      pb="20px"
      px={{ base: '20px', xl: '30px' }}
    >
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
        {vin.map((input, i) => {
          const bindingCkbCell = ckbCell?.inputs?.find((cell) => {
            if (!isRgbppLockCell(cell)) return false
            const { btcTxid, outIndex } = parseRgbppLockArgs(cell.lock.args)
            return !(btcTxid !== input.txid || input.vout !== outIndex)
          })
          return <UtxoInput vin={input} key={i} currentAddress={currentAddress} ckbCell={bindingCkbCell} />
        })}
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
        {vout.map((output, i) => {
          const bindingCkbCell = ckbCell?.outputs?.find((cell) => {
            if (!isRgbppLockCell(cell)) return false
            const { btcTxid, outIndex } = parseRgbppLockArgs(cell.lock.args)
            return !(btcTxid !== txid || outIndex !== i || !vout[outIndex])
          })
          return (
            <UtxoOutput
              ckbCell={bindingCkbCell}
              vout={output}
              key={i}
              currentAddress={currentAddress}
              ckbOutputs={ckbCell?.outputs}
            />
          )
        })}
      </VStack>
    </Grid>
  )
}

function UtxoInput({
  vin,
  currentAddress,
  ckbCell: cell,
}: {
  vin: BitcoinInput
  currentAddress?: string
  ckbCell?: CkbCell
}) {
  const text = useMemo(() => {
    if (vin.isCoinbase)
      return (
        <Text fontSize="14px" fontWeight="semibold">
          <Trans>Coinbase</Trans>
        </Text>
      )
    if (!vin.prevout) return null
    const formattedAddress = (
      <IfBreakpoint breakpoint="sm" fallback={truncateMiddle(vin.prevout.address?.address ?? '', 6, 6)}>
        {truncateMiddle(vin.prevout.address?.address ?? '', 10, 10)}
      </IfBreakpoint>
    )
    return (
      <Copier onlyIcon value={vin.prevout.address?.address}>
        {currentAddress === vin.prevout.address?.address ? (
          <Text as="span" color="text.primary">
            {formattedAddress}
          </Text>
        ) : (
          <Link href={`/address/${vin.prevout.address?.address}`} color="brand" fontSize="14px">
            {formattedAddress}
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
          color={vin.isCoinbase || vin.prevout?.status?.spent ? 'text.third' : 'success.unspent'}
          w="16px"
          h="16px"
        />
        {text}
      </HStack>
      <VStack gap={0} textAlign="right" alignItems="right">
        <Box>
          {formatNumber(satsToBtc(vin.prevout?.value ?? '0'))}{' '}
          <Text as="span" fontSize="12px" color="text.third">
            <Trans>BTC</Trans>
          </Text>
        </Box>
        {cell ? (
          <>
            {cell.xudtInfo ? (
              <Box>
                {formatNumber(cell.xudtInfo.amount, cell.xudtInfo.decimal)}{' '}
                <Text as="span" fontSize="12px" color="text.third">
                  {cell.xudtInfo.symbol}
                </Text>
              </Box>
            ) : null}
            {cell.cellType === CellType.Dob || cell.cellType === CellType.Mnft ? (
              <Box>
                1
                <Text as="span" fontSize="12px" color="text.third" ml="4px">
                  <Trans>DOB</Trans>
                </Text>
              </Box>
            ) : null}
          </>
        ) : null}
      </VStack>
    </Flex>
  )
}

function UtxoOutput({
  vout,
  currentAddress,
  ckbCell: cell,
}: {
  vout: BitcoinOutput
  ckbCell?: CkbCell
  currentAddress?: string
  ckbOutputs?: CkbTransaction['outputs']
}) {
  const formattedAddress = (
    <IfBreakpoint breakpoint="sm" fallback={truncateMiddle(vout.address?.address ?? '', 6, 6)}>
      {truncateMiddle(vout.address?.address ?? '', 10, 10)}
    </IfBreakpoint>
  )
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
            vout.status?.spent || vout.scriptpubkeyType === ScriptpubkeyType.OpReturn ? 'text.third' : 'success.unspent'
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
                {formattedAddress}
              </Text>
            ) : (
              <Link href={`/address/${vout.address?.address}`} color="brand" fontSize="14px">
                {formattedAddress}
              </Link>
            )}
          </Copier>
        )}
      </HStack>
      <VStack gap={0} alignItems="right" textAlign="right">
        <Box>
          {formatNumber(satsToBtc(vout.value))}{' '}
          <Text as="span" fontSize="12px" color="text.third">
            <Trans>BTC</Trans>
          </Text>
        </Box>
        {cell ? (
          <>
            {cell.xudtInfo ? (
              <Box>
                {formatNumber(cell.xudtInfo.amount, cell.xudtInfo.decimal)}{' '}
                <Text as="span" fontSize="12px" color="text.third">
                  {cell.xudtInfo.symbol}
                </Text>
              </Box>
            ) : null}
            {cell.cellType === CellType.Dob || cell.cellType === CellType.Mnft ? (
              <Box>
                1
                <Text as="span" fontSize="12px" color="text.third" ml="4px">
                  <Trans>DOB</Trans>
                </Text>
              </Box>
            ) : null}
          </>
        ) : null}
      </VStack>
    </Flex>
  )
}
