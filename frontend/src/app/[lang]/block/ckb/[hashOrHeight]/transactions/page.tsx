import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { Flex, HStack, VStack } from 'styled-system/jsx'

import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { CkbOutputsSum } from '@/components/ckb/ckb-outputs-sum'
import { TimeFormatter } from '@/components/time-formatter'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { formatNumber } from '@/lib/string/format-number'

const query = graphql(`
  query CkbBlockTransactions($hashOrHeight: String!) {
    ckbBlock(heightOrHash: $hashOrHeight) {
      timestamp
      transactions {
        isCellbase
        blockNumber
        hash
        fee
        size
        feeRate
        confirmations
        outputs {
          txHash
          index
          capacity
          lock {
            codeHash
            hashType
            args
          }
          type {
            codeHash
            hashType
            args
          }
          xudtInfo {
            symbol
            amount
            decimal
            typeHash
          }
          status {
            consumed
            txHash
            index
          }
        }
        inputs {
          status {
            consumed
            txHash
            index
          }
          txHash
          index
          capacity
          lock {
            codeHash
            hashType
            args
          }
          type {
            codeHash
            hashType
            args
          }
          xudtInfo {
            symbol
            amount
            decimal
            typeHash
          }
        }
      }
    }
  }
`)

export default async function Page({ params: { hashOrHeight } }: { params: { hashOrHeight: string } }) {
  const i18n = getI18nFromHeaders()
  const data = await graphQLClient.request(query, { hashOrHeight })

  if (!data?.ckbBlock) notFound()

  return (
    <VStack w="100%" gap="30px">
      {data.ckbBlock.transactions.map((transaction) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={transaction.hash}>
            <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
              <Link
                href={`/transaction/${transaction.hash}`}
                fontSize="14px"
                fontWeight="medium"
                color="brand"
                _hover={{ textDecoration: 'underline' }}
              >
                {transaction.hash}
              </Link>
              <TimeFormatter timestamp={data.ckbBlock?.timestamp} />
            </Flex>
            <CkbCellTables
              inputs={transaction.inputs}
              outputs={transaction.outputs}
              isCellbase={transaction.isCellbase}
            />
            <Flex
              minH="72px"
              px="30px"
              w="100%"
              alignItems="center"
              borderTop="1px solid"
              borderTopColor="border.primary"
              whiteSpace="nowrap"
            >
              <HStack gap="32px" mb="auto" h="72px">
                <Text as="span" fontSize="14px" color="text.third">
                  {t(i18n)`Txn fee: `}
                  <Text as="span" color="text.primary" fontWeight="semibold" mx="4px">
                    {formatNumber(transaction.fee)}
                  </Text>
                  {t(i18n)`shannons`}
                </Text>
                <Text as="span" fontSize="14px" color="text.third">
                  {t(i18n)`Fee rate: `}
                  <Text as="span" color="text.primary" fontWeight="semibold" mx="4px">
                    {formatNumber(transaction.feeRate)}
                  </Text>
                  {t(i18n)`shannons/kB`}
                </Text>
              </HStack>
              <HStack gap="16px" ml="auto" flexWrap="wrap" justify="right" py="12px">
                <CkbOutputsSum outputs={transaction.outputs} />
              </HStack>
            </Flex>
          </VStack>
        )
      })}
    </VStack>
  )
}
