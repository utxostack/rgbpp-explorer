'use client'

import { Trans } from '@lingui/macro'
import { isNumber } from 'lodash-es'
import { ReactNode } from 'react'
import { Box, Flex, HStack } from 'styled-system/jsx'

import { CkbDiffTags } from '@/components/ckb/ckb-diff-tags'
import { Text } from '@/components/ui'
import { CkbTransaction } from '@/gql/graphql'
import { formatNumber } from '@/lib/string/format-number'

export function UtxoOrCellFooter({
  fee,
  feeRate,
  confirmations,
  ckbCell,
  feeUnit,
  address,
}: {
  address: string
  fee?: number
  feeRate?: number
  confirmations?: number
  ckbCell?: Pick<CkbTransaction, 'inputs' | 'outputs'>
  feeUnit?: ReactNode
}) {
  return (
    <Flex
      h="72px"
      px="30px"
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      borderTop="1px solid"
      borderTopColor="border.primary"
    >
      <HStack gap="32px">
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
              {feeUnit}
            </Trans>
          </Text>
        ) : null}
      </HStack>
      <HStack gap="16px">
        {ckbCell ? <CkbDiffTags {...ckbCell} address={address} /> : null}
        {isNumber(confirmations) ? (
          <Box bg="brand" py="8px" px="16px" rounded="4px">
            <Trans>{formatNumber(confirmations)} confirmed</Trans>
          </Box>
        ) : null}
      </HStack>
    </Flex>
  )
}
