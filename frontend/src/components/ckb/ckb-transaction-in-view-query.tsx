'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { Skeleton, SkeletonProps } from '@/components/ui/primitives/skeleton'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { CkbTransaction } from '@/gql/graphql'
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

export function CkbTransactionInViewQuery({
  children,
  hash,
  fallback,
  ...props
}: Omit<SkeletonProps, 'children'> & {
  children: (ckbTransaction: CkbTransaction) => ReactNode
  hash: string
  fallback?: ReactNode
}) {
  const [enabled, setEnabled] = useState(false)
  const [ref] = useInView({
    threshold: 0,
    onChange(view) {
      if (view) setEnabled(true)
    },
  })
  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKey.CkbTransactionCardInAddressList, hash],
    async queryFn() {
      const { ckbTransaction } = await graphQLClient.request(query, {
        hash,
      })
      return ckbTransaction
    },
    enabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retryOnMount: false,
  })

  if (error) return fallback

  return (
    <Skeleton ref={ref} isLoaded={!isLoading} minH={!data ? '480px' : 'auto'} w="100%" {...props}>
      {data ? children(data as CkbTransaction) : null}
    </Skeleton>
  )
}
