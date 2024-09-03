import { t } from '@lingui/macro'
import { Center, HStack, VStack } from 'styled-system/jsx'

import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { FailedFallback } from '@/components/failed-fallback'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { NoData } from '@/components/no-data'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { Text } from '@/components/ui'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'
import { formatNumber } from '@/lib/string/format-number'

const query = graphql(`
  query CkbAddress($address: String!, $page: Float!, $pageSize: Float!) {
    ckbAddress(address: $address) {
      transactionsCount
      transactions(page: $page, pageSize: $pageSize) {
        isCellbase
        blockNumber
        hash
        fee
        size
        feeRate
        confirmations
        inputs {
          cellType
          status {
            consumed
            txHash
            index
          }
          txHash
          index
          capacity
          type {
            codeHash
            hashType
            args
          }
          lock {
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
        outputs {
          txHash
          cellType
          index
          capacity
          type {
            codeHash
            hashType
            args
          }
          lock {
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
        block {
          timestamp
        }
      }
    }
  }
`)

export async function CkbTransactionsByAddress({ address }: { address: string }) {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()
  const pageSize = 10
  const { ckbAddress } = await graphQLClient.request(query, {
    address,
    page,
    pageSize,
  })

  if (!ckbAddress) {
    return <FailedFallback />
  }

  const total = ckbAddress?.transactionsCount ?? 0

  return (
    <>
      {!ckbAddress.transactions?.length ? (
        <Center w="100%" bg="bg.card" pt="80px" pb="120px" rounded="8px">
          <NoData>{t(i18n)`No Transaction`}</NoData>
        </Center>
      ) : (
        ckbAddress.transactions?.map((tx) => {
          return (
            <VStack key={tx.hash} w="100%" gap={0} bg="bg.card" rounded="8px">
              <TransactionHeaderInAddress time={tx.block?.timestamp} txid={tx.hash} />
              <CkbCellTables inputs={tx.inputs} outputs={tx.outputs} isCellbase={tx.isCellbase} address={address} />
              <UtxoOrCellFooter
                fee={tx.fee}
                confirmations={tx.confirmations}
                feeRate={tx.feeRate}
                ckbCell={tx}
                feeUnit={t(i18n)`shannons`}
                address={address}
              />
            </VStack>
          )
        })
      )}
      <HStack gap="16px" mt="auto" p={{ base: '20px', xl: '30px' }}>
        <IfBreakpoint breakpoint="md">
          <Text fontSize="14px">{t(i18n)`Total ${formatNumber(total)} Items`}</Text>
        </IfBreakpoint>
        <PaginationSearchParams count={total} pageSize={pageSize} />
      </HStack>
    </>
  )
}
