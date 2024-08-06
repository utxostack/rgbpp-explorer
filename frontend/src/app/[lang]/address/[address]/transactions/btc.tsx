import { last } from 'lodash-es'
import { Center, HStack } from 'styled-system/jsx'

import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { FailedFallback } from '@/components/failed-fallback'
import { Button } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { BitcoinTransaction } from '@/gql/graphql'
import { getUrl } from '@/lib/get-url'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query BtcTransactionByAddress($address: String!, $afterTxid: String) {
    btcAddress(address: $address) {
      transactions(afterTxid: $afterTxid) {
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
  }
`)

export async function BtcTransactionsByAddress({ address }: { address: string }) {
  const url = getUrl()
  const afterTxid = url.searchParams.get('afterTxid')

  const { btcAddress } = await graphQLClient.request(query, {
    address,
    afterTxid,
  })

  if (!btcAddress) {
    return <FailedFallback />
  }

  return (
    <>
      {btcAddress.transactions.map((tx) => {
        return <BtcTransactionCardInAddress address={address} tx={tx as BitcoinTransaction} key={tx.txid} />
      })}
      <Center w="100%">
        <HStack gap="16px">
          {afterTxid ? (
            <Link href={`/address/${address}/transactions`}>
              <Button>Back to first page</Button>
            </Link>
          ) : null}
          <Link
            href={{
              pathname: `/address/${address}/transactions`,
              query: {
                afterTxid: last(btcAddress.transactions)?.txid,
              },
            }}
          >
            <Button>Next</Button>
          </Link>
        </HStack>
      </Center>
    </>
  )
}
