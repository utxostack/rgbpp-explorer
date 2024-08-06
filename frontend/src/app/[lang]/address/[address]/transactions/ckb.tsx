import { t } from '@lingui/macro'
import { Flex, VStack } from 'styled-system/jsx'

import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { Copier } from '@/components/copier'
import { FailedFallback } from '@/components/failed-fallback'
import { TimeFormatter } from '@/components/time-formatter'
import Link from '@/components/ui/link'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { graphql } from '@/gql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query CkbAddress($address: String!, $page: Float!, $pageSize: Float!) {
    ckbAddress(address: $address) {
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
          number
        }
      }
    }
  }
`)

export async function CkbTransactionsByAddress({ address }: { address: string }) {
  const i18n = getI18nFromHeaders()
  const { ckbAddress } = await graphQLClient.request(query, {
    address,
    page: 1,
    pageSize: 10,
  })

  if (!ckbAddress) {
    return <FailedFallback />
  }

  return ckbAddress.transactions.map((tx) => {
    return (
      <VStack key={tx.hash} w="100%" gap={0} bg="bg.card" rounded="8px">
        <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
          <Copier value={tx.hash} onlyIcon>
            <Link color="brand" href={`/transaction/${tx.hash}`}>
              {tx.hash}
            </Link>
          </Copier>
          {tx.block ? <TimeFormatter timestamp={tx.block.timestamp} /> : null}
        </Flex>
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
}
