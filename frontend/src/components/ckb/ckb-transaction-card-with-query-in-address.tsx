import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { VStack } from 'styled-system/jsx'

import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { Skeleton } from '@/components/ui/primitives/skeleton'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query CkbTransactionByHash($hash: String!) {
    ckbTransaction(txHash: $hash) {
      hash
      isCellbase
      blockNumber
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
`)

export function CkbTransactionCardWithQueryInAddress({ hash, address }: { address: string; hash: string }) {
  const [ref, inView] = useInView({
    threshold: 0,
  })
  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKey.BtcTransactionCardWithQueryInAddress, hash],
    async queryFn() {
      const { ckbTransaction } = await graphQLClient.request(query, {
        hash,
      })
      return ckbTransaction
    },
    enabled: inView,
  })

  if (error) return null

  return (
    <Skeleton ref={ref} isLoaded={!isLoading} minH={!data ? '480px' : 'auto'} w="100%">
      {data ? (
        <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
          <TransactionHeaderInAddress time={data.block?.timestamp} txid={data.hash} />
          <CkbCellTables inputs={data.inputs} outputs={data.outputs} isCellbase={data.isCellbase} address={address} />
          <UtxoOrCellFooter
            fee={data.fee}
            confirmations={data.confirmations}
            feeRate={data.feeRate}
            ckbCell={data}
            feeUnit={<Trans>shannons</Trans>}
            address={address}
          />
        </VStack>
      ) : null}
    </Skeleton>
  )
}
