'use client'

import { Trans } from '@lingui/macro'
import { isNumber } from 'lodash-es'

import { Text } from '@/components/ui'
import { formatNumber } from '@/lib/string/format-number'

import { Box, Flex, HStack } from 'styled-system/jsx'

export function UtxoOrCellFooter({
  fee,
  feeRate,
  confirmations,
}: {
  fee?: number
  feeRate?: number
  confirmations?: number
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
              sats
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
              sats/vB
            </Trans>
          </Text>
        ) : null}
      </HStack>
      <HStack gap="16px">
        {isNumber(confirmations) ? (
          <Box bg="brand" py="8px" px="16px" rounded="4px">
            <Trans>{formatNumber(confirmations)} confirmed</Trans>
          </Box>
        ) : null}
      </HStack>
    </Flex>
  )
}
