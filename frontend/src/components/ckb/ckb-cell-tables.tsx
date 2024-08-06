'use client'

import { Trans } from '@lingui/macro'
import { Box, Flex, Grid, HStack, VStack } from 'styled-system/jsx'

import SubTractIcon from '@/assets/subtract.svg'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { CellType, CkbCell } from '@/gql/graphql'
import { scriptToAddress } from '@/lib/ckb/script-to-address'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

export interface CellTablesProps {
  inputs?: CkbCell[]
  outputs?: CkbCell[]
  isCellbase?: boolean
  address?: string
}

export function CkbCellTables({ inputs = [], outputs = [], isCellbase, address }: CellTablesProps) {
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
          <Trans>Inputs ({inputs.length})</Trans>
        </Heading>
        {isCellbase ? (
          <Flex
            align="center"
            w="100%"
            h="60px"
            alignItems="center"
            borderBottom="1px solid"
            borderBottomColor="border.primary"
          >
            <HStack gap="8px">
              <SubTractIcon w="16px" h="16px" color="text.third" />
              <Text fontSize="14px" fontWeight="semibold">
                <Trans>Coinbase</Trans>
              </Text>
            </HStack>
          </Flex>
        ) : null}
        {inputs.map((input, i) => (
          <Cell cell={input} key={i} address={address} />
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
          <Trans>Outputs ({outputs.length})</Trans>
        </Heading>
        {outputs.map((output, i) => (
          <Cell cell={output} key={i} address={address} />
        ))}
      </VStack>
    </Grid>
  )
}

function Cell({ cell, address: currentAddress }: { cell: CkbCell; address?: string }) {
  const address = scriptToAddress(cell.lock)
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
        <SubTractIcon w="16px" h="16px" color={cell.status.consumed ? 'text.third' : 'success.unspent'} />
        <Copier onlyIcon value={address}>
          {currentAddress !== address ? (
            <Link
              href={`/address/${address}`}
              color="brand"
              fontSize="14px"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
            >
              {truncateMiddle(address, 10, 10)}
            </Link>
          ) : (
            <Text fontSize="14px" color="text.primary">
              {truncateMiddle(address, 10, 10)}
            </Text>
          )}
        </Copier>
      </HStack>
      <VStack gap={0} alignItems="flex-end">
        <Box>
          {formatNumber(shannonToCKB(cell.capacity))}{' '}
          <Text as="span" fontSize="12px" color="text.third">
            <Trans>CKB</Trans>
          </Text>
        </Box>
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
      </VStack>
    </Flex>
  )
}
