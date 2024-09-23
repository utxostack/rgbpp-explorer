import { t } from '@lingui/macro'
import { last } from 'lodash-es'
import { notFound } from 'next/navigation'
import { Center, HStack, VStack } from 'styled-system/jsx'

import { getI18nInstance } from '@/app/[lang]/appRouterI18n'
import { BtcTransactionCardInAddress } from '@/components/btc/btc-transaction-card-in-address'
import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { NoData } from '@/components/no-data'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { Button, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { graphql } from '@/gql'
import { BitcoinTransaction, CkbTransaction } from '@/gql/graphql'
import { isValidBTCAddress } from '@/lib/btc/is-valid-btc-address'
import { isValidCkbAddress } from '@/lib/ckb/is-valid-ckb-address'
import { graphQLClient } from '@/lib/graphql'
import { resolvePage } from '@/lib/resolve-page'
import { formatNumber } from '@/lib/string/format-number'

export const maxDuration = 30

const btcAddressTxsQuery = graphql(`
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

const ckbAddressTxsQuery = graphql(`
  query CkbAddress($address: String!, $page: Int!, $pageSize: Int!) {
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

export default async function Page({
  params: { address, lang },
  searchParams,
}: {
  params: { address: string; lang: string }
  searchParams: { page?: string; afterTxid?: string }
}) {
  const { afterTxid } = searchParams
  const i18n = getI18nInstance(lang)
  if (isValidBTCAddress(address)) {
    const { btcAddress } = await graphQLClient.request(btcAddressTxsQuery, {
      address,
      afterTxid,
    })

    const nextCursor = last(btcAddress?.transactions)?.txid

    if (!btcAddress) notFound()

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

  if (isValidCkbAddress(address)) {
    const page = resolvePage(searchParams.page)
    const pageSize = 10
    const { ckbAddress } = await graphQLClient.request(ckbAddressTxsQuery, {
      address,
      page,
      pageSize,
    })

    if (!ckbAddress) notFound()

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
  return notFound()
}
