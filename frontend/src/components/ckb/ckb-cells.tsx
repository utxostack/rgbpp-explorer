import { t } from '@lingui/macro'

import { CkbTransaction } from '@/apis/types/explorer-graphql'
import CkbIcon from '@/assets/chains/ckb.svg'
import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { Text } from '@/components/ui'
import { ViewCkbExplorer } from '@/components/view-ckb-explorer'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

import { Flex, HStack, VStack } from '../../../styled-system/jsx'

export function CkbCells({ ckbTransaction }: { ckbTransaction: CkbTransaction }) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
      <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
        <HStack gap="16px">
          <CkbIcon h="40px" w="40px" />
          <Text fontSize="16px" fontWeight="semibold">{t(i18n)`CKB Txn`}</Text>
        </HStack>
        <ViewCkbExplorer txHash={ckbTransaction.hash} />
      </Flex>
      <CkbCellTables outputs={ckbTransaction.outputs} inputs={ckbTransaction.inputs} />
    </VStack>
  )
}
