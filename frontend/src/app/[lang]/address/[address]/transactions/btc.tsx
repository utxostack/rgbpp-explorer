import { t } from '@lingui/macro'
import { last } from 'lodash-es'
import { Center, HStack } from 'styled-system/jsx'

import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { FailedFallback } from '@/components/failed-fallback'
import { NoData } from '@/components/no-data'
import { Button } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { getUrl } from '@/lib/get-url'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query BtcTransactionByAddress($address: String!, $afterTxid: String) {
    btcAddress(address: $address) {
      transactions(afterTxid: $afterTxid) {
        txid
        rgbppTransaction {
          ckbTransaction {
            isCellbase
            blockNumber
            hash
            fee
            feeRate
            size
            confirmed
            confirmations
            outputs {
              txHash
              index
              capacity
              cellType
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
              status {
                consumed
                txHash
                index
              }
              xudtInfo {
                symbol
                amount
                decimal
                typeHash
              }
            }
            inputs {
              txHash
              index
              capacity
              cellType
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
              hash
            }
          }
        }
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
  const i18n = getI18nFromHeaders()
  const url = getUrl()
  const afterTxid = url.searchParams.get('afterTxid')

  const { btcAddress } = await graphQLClient.request(query, {
    address,
    afterTxid,
  })

  const nextCursor = last(btcAddress?.transactions)?.txid

  if (!btcAddress) {
    return <FailedFallback />
  }

  return (
    <>
      {!btcAddress.transactions?.length ? (
        <Center w="100%" bg="bg.card" pt="80px" pb="120px" rounded="8px">
          <NoData>{t(i18n)`No Transaction`}</NoData>
        </Center>
      ) : (
        btcAddress.transactions?.map(({ rgbppTransaction, ...tx }) => {
          return (
            <BtcTransactionCardInAddress
              address={address}
              tx={tx as BitcoinTransaction}
              ckbCell={rgbppTransaction?.ckbTransaction as CkbTransaction}
              key={tx.txid}
            />
          )
        })
      )}
      <Center w="100%">
        <HStack gap="16px">
          {afterTxid ? (
            <Link href={`/address/${address}/transactions`}>
              <Button>{t(i18n)`Back to first page`}</Button>
            </Link>
          ) : null}
          {nextCursor ? (
            <Link
              href={{
                pathname: `/address/${address}/transactions`,
                query: {
                  afterTxid: nextCursor,
                },
              }}
            >
              <Button>{t(i18n)`Next`}</Button>
            </Link>
          ) : null}
        </HStack>
      </Center>
    </>
  )
}
