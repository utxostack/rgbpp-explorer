'use client'

import { Trans } from '@lingui/macro'
import { isNumber } from 'lodash-es'
import { ReactNode } from 'react'
import { Box, Flex, HStack } from 'styled-system/jsx'

import { BtcDiffTags } from '@/components/btc/btc-diff-tags'
import { CkbDiffTags } from '@/components/ckb/ckb-diff-tags'
import { Text } from '@/components/ui'
import { BitcoinInput, BitcoinOutput, CkbTransaction } from '@/gql/graphql'
import { formatNumber } from '@/lib/string/format-number'

export function UtxoOrCellFooter({
  fee,
  feeRate,
  confirmations,
  ckbCell,
  btcUtxo,
  feeUnit,
  address,
  children,
}: {
  address?: string
  fee?: number | null
  feeRate?: number | null
  confirmations?: number
  ckbCell?: Pick<CkbTransaction, 'inputs' | 'outputs'>
  btcUtxo?: {
    vin?: BitcoinInput[]
    vout?: BitcoinOutput[]
  }
  feeUnit?: ReactNode
  children?: ReactNode
}) {
  return (
    <Flex
      minH="72px"
      py="20px"
      px={{ base: '20px', xl: '30px' }}
      gap={{ base: '20px', lg: '10px' }}
      w="100%"
      flexDirection={{ base: 'column', lg: 'row' }}
      alignItems={{ base: 'start', lg: 'center' }}
      justifyContent={{ base: 'center', lg: 'space-between' }}
      borderTop="1px solid"
      borderTopColor="border.primary"
    >
      <Flex gap={{ base: '16px', lg: '32px' }} flexWrap="wrap" justify="start">
        {isNumber(fee) ? (
          <Text as="span" fontSize="14px" color="text.third">
            <Trans>
              Txn fee:
              <Text as="span" color="text.primary" fontWeight="semibold" mx="4px">
                {formatNumber(fee)}{' '}
              </Text>
              {feeUnit}
            </Trans>
          </Text>
        ) : null}
        {isNumber(feeRate) ? (
          <Text as="span" fontSize="14px" color="text.third">
            <Trans>
              Fee rate:
              <Text as="span" color="text.primary" fontWeight="semibold" mx="4px">
                {formatNumber(feeRate)}
              </Text>
              {feeUnit}/vB
            </Trans>
          </Text>
        ) : null}
      </Flex>
      {isNumber(confirmations) || btcUtxo || ckbCell || address ? (
        <HStack gap="16px" flexWrap="wrap" justify={{ base: 'start', lg: 'end' }}>
          {isNumber(confirmations) ? (
            <Box bg="brand" py="8px" fontSize="14px" lineHeight="16px" px="16px" rounded="4px">
              <Trans>{formatNumber(confirmations)} confirmed</Trans>
            </Box>
          ) : null}
          {ckbCell && address ? <CkbDiffTags {...ckbCell} address={address} /> : null}
          {btcUtxo && address ? <BtcDiffTags {...btcUtxo} ckbCell={ckbCell} address={address} /> : null}
        </HStack>
      ) : null}
      {children}
    </Flex>
  )
}
