import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { HStack, VStack } from 'styled-system/jsx'

import LinkOutlineIcon from '@/assets/link-outline.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { Amount } from '@/components/last-rgbpp-txns-table/amount'
import { LayerType } from '@/components/layer-type'
import { PaginationSearchParams } from '@/components/pagination-searchparams'
import { Table, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { CkbTransaction, RgbppTransaction } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { resolveLayerTypeFromRGBppTransaction } from '@/lib/resolve-layer-type-from-rgbpp-transaction'
import { resolveRGBppTxHash } from '@/lib/resolve-rgbpp-tx-hash'
import { resolveSearchParamsPage } from '@/lib/resolve-searchparams-page'
import { formatNumber } from '@/lib/string/format-number'
import { truncateMiddle } from '@/lib/string/truncate-middle'

const query = graphql(`
  query RgbppCoinTransactionsByTypeHash($typeHash: String!, $page: Int!, $pageSize: Int!) {
    rgbppCoin(typeHash: $typeHash) {
      transactionsCount
      transactions(page: $page, pageSize: $pageSize) {
        ckbTxHash
        btcTxid
        leapDirection
        blockNumber
        timestamp
        ckbTransaction {
          isCellbase
          blockNumber
          hash
          fee
          feeRate
          size
          confirmations
          inputs {
            txHash
            index
            capacity
            status {
              consumed
              txHash
              index
            }
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
            index
            capacity
            status {
              consumed
              txHash
              index
            }
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
        }
        btcTransaction {
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
  }
`)

export default async function Page({ params: { typeHash } }: { params: { typeHash: string } }) {
  const i18n = getI18nFromHeaders()
  const page = resolveSearchParamsPage()
  const pageSize = 10
  const response = await graphQLClient.request(query, { typeHash, page, pageSize })
  if (!response.rgbppCoin) notFound()

  return (
    <VStack w="100%" bg="bg.card" maxW="content" rounded="8px" pt="30px">
      <Table.Root tableLayout="fixed">
        <Table.Head>
          <Table.Row>
            <Table.Header>{t(i18n)`Tx hash`}</Table.Header>
            <Table.Header>{t(i18n)`Type`}</Table.Header>
            <Table.Header>{t(i18n)`Amount`}</Table.Header>
            <Table.Header>{t(i18n)`Time`}</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {response.rgbppCoin.transactions?.map((tx) => {
            const txHash = resolveRGBppTxHash(tx as RgbppTransaction)
            return (
              <Table.Row key={tx.ckbTxHash} tableLayout="fixed">
                <Table.Cell>
                  <Link href={`/transaction/${txHash}`} display="flex" alignItems="center" gap={3} color="text.link">
                    <LinkOutlineIcon w="36px" h="36px" />
                    {truncateMiddle(txHash, 10, 8)}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <LayerType type={resolveLayerTypeFromRGBppTransaction(tx as RgbppTransaction)} />
                </Table.Cell>
                <Table.Cell>
                  <Amount ckbTransaction={tx.ckbTransaction as CkbTransaction} />
                </Table.Cell>
                <Table.Cell w="165px">
                  <AgoTimeFormatter time={tx.timestamp} tooltip />
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>

      <HStack ml="auto" gap="16px" mt="auto" p="30px">
        <Text fontSize="14px">{t(
          i18n,
        )`Total ${formatNumber(response.rgbppCoin.transactionsCount ?? undefined)} Items`}</Text>
        <PaginationSearchParams count={response.rgbppCoin.transactionsCount ?? 0} pageSize={pageSize} />
      </HStack>
    </VStack>
  )
}
