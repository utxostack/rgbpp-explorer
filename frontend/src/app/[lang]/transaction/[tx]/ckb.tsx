import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { CkbTransaction } from '@/apis/types/explorer-graphql'
import { CkbCells } from '@/components/ckb/ckb-cells'
import { CkbTransactionOverflow } from '@/components/ckb/ckb-transaction-overflow'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'
import { formatNumber } from '@/lib/string/format-number'

export function CKBTransactionPage({ ckbTransaction }: { ckbTransaction: CkbTransaction }) {
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Transactions`}
        </Heading>
        <Copier value={ckbTransaction.hash}>{ckbTransaction.hash}</Copier>
        <Box
          color="brand"
          fontWeight="semibold"
          fontSize="20px"
          lineHeight="24px"
          py="4px"
          px="12px"
          rounded="4px"
          bg="brand.a10"
          border="1px solid currentColor"
          ml="auto"
        >
          {formatNumber(ckbTransaction.confirmations)}{' '}
          <Text as="span" fontSize="14px" fontWeight="medium">
            {t(i18n)`confirmations`}
          </Text>
        </Box>
      </HStack>
      <CkbTransactionOverflow ckbTransaction={ckbTransaction} />
      <CkbCells ckbTransaction={ckbTransaction} />
    </VStack>
  )
}
