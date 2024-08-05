import { t } from '@lingui/macro'
import { Flex, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

export default async function Page({ params: { hashOrHeight } }: { params: { hashOrHeight: string } }) {
  const i18n = getI18nFromHeaders()
  const data = await explorerGraphql.getCkbBlockTransaction(hashOrHeight)

  return (
    <VStack w="100%" gap="30px">
      {data.ckbBlock.transactions.map((transaction) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={transaction.hash}>
            <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
              <Link href={`/transaction/${transaction.hash}`} fontSize="16px" fontWeight="semibold" color="brand">
                {transaction.hash}
              </Link>
            </Flex>
            <CkbCellTables inputs={transaction.inputs} outputs={transaction.outputs} />
            <Flex h="72px" px="30px" w="100%" alignItems="center" borderTop="1px solid" borderTopColor="border.primary">
              <Text as="span" fontSize="14px" color="text.third">
                {t(i18n)`Txn fee: `}{' '}
                <Text as="span" color="text.primary" fontWeight="semibold">
                  {formatNumber(transaction.fee)}{' '}
                </Text>
                {t(i18n)`shannons/kB`}
              </Text>
            </Flex>
          </VStack>
        )
      })}
    </VStack>
  )
}
