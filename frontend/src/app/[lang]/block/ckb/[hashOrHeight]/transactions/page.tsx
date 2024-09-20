import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { HStack, VStack } from 'styled-system/jsx'

import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { CkbOutputsSum } from '@/components/ckb/ckb-outputs-sum'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

export const dynamic = 'force-static'
export const revalidate = 10

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
      {data.ckbBlock.transactions?.map((tx) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={tx.hash}>
            <TransactionHeaderInAddress time={data.ckbBlock?.timestamp} txid={tx.hash} />
            <CkbCellTables inputs={tx.inputs} outputs={tx.outputs} isCellbase={tx.isCellbase} />
            <UtxoOrCellFooter fee={tx.fee} feeRate={tx.feeRate} feeUnit={t(i18n)`sats`}>
              <HStack gap="16px" flexWrap="wrap" justify={{ base: 'start', lg: 'end' }}>
                <CkbOutputsSum outputs={tx.outputs} />
              </HStack>
            </UtxoOrCellFooter>
          </VStack>
        )
      })}
    </VStack>
  )
}
