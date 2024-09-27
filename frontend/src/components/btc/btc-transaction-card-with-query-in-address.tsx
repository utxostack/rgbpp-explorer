import { useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { Skeleton } from '@/components/ui/primitives/skeleton'
import { QueryKey } from '@/constants/query-key'
import { graphql } from '@/gql'
import { BitcoinTransaction } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'

const btcTransactionQuery = graphql(`
  query BtcTransactionByTxId($txid: String!) {
    btcTransaction(txid: $txid) {
      blockHeight
      blockHash
      txid
      version
      size
      locktime
      weight
      fee
      feeRate
      confirmed
      confirmations
      transactionTime
      vin {
        txid
        vout
        scriptsig
        scriptsigAsm
        isCoinbase
        sequence
        prevout {
          scriptpubkey
          scriptpubkeyAsm
          scriptpubkeyType
          scriptpubkeyAddress
          value
          status {
            spent
            txid
            vin
          }
          address {
            address
            satoshi
            pendingSatoshi
            transactionsCount
          }
        }
      }
      vout {
        scriptpubkey
        scriptpubkeyAsm
        scriptpubkeyType
        scriptpubkeyAddress
        value
        status {
          spent
          txid
          vin
        }
        address {
          address
          satoshi
          pendingSatoshi
          transactionsCount
        }
      }
    }
  }
`)

interface Props {
  txid: string
  ckbTxHash?: string
  address: string
}

export function BtcTransactionCardWithQueryInAddress({ txid, address }: Props) {
  const [ref, inView] = useInView({
    threshold: 0,
  })
  const { data, isLoading } = useQuery({
    queryKey: [QueryKey.BtcTransactionCardWithQueryInAddress, txid],
    async queryFn() {
      const { btcTransaction } = await graphQLClient.request(btcTransactionQuery)
      return btcTransaction
    },
    enabled: inView,
  })

  return (
    <Skeleton ref={ref} isLoaded={!!data} h={isLoading ? '480px' : 'auto'}>
      {data ? <BtcTransactionCardInAddress tx={data as BitcoinTransaction} address={address} /> : null}
    </Skeleton>
  )
}
