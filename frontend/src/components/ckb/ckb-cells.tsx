import { t } from '@lingui/macro'
import { Flex, HStack, VStack } from 'styled-system/jsx'

import CkbIcon from '@/assets/chains/ckb.svg'
import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { ViewCkbExplorer } from '@/components/view-ckb-explorer'
import { CkbTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export function CkbCells({
  ckbTransaction,
  isBinding,
}: {
  ckbTransaction: Pick<CkbTransaction, 'hash' | 'outputs' | 'inputs'>
  isBinding?: boolean
}) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
      <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
        <HStack gap="16px">
          <CkbIcon h="40px" w="40px" />
          {isBinding ? (
            <VStack alignItems="start" gap={0}>
              <Text fontSize="16px" fontWeight="semibold">{t(i18n)`RGB++ Binding Txn on CKB`}</Text>
              <Link
                href={`/transaction/${ckbTransaction.hash}`}
                color="brand"
                fontSize="14px"
                _hover={{
                  textDecoration: 'underline',
                }}
              >
                {ckbTransaction.hash}
              </Link>
            </VStack>
          ) : (
            <Text fontSize="16px" fontWeight="semibold">{t(i18n)`CKB Txn`}</Text>
          )}
        </HStack>
        <ViewCkbExplorer txHash={ckbTransaction.hash} />
      </Flex>
      <CkbCellTables outputs={ckbTransaction.outputs} inputs={ckbTransaction.inputs} />
    </VStack>
  )
}
