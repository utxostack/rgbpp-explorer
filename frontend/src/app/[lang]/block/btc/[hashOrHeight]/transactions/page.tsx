import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { HStack, VStack } from 'styled-system/jsx'

import { BtcOutputsSum } from '@/components/btc/btc-outputs-sum'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { TransactionHeaderInAddress } from '@/components/transaction-header-in-address'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { graphql } from '@/gql'
import { BitcoinInput, BitcoinOutput } from '@/gql/graphql'
import { graphQLClient } from '@/lib/graphql'
import { withI18n } from '@/lib/with-i18n'

export const dynamic = 'force-static'
export const revalidate = 10

const query = graphql(`
  query BtcBlockTransaction($hashOrHeight: String!) {
    btcBlock(hashOrHeight: $hashOrHeight) {
      timestamp
      transactions {
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
        transactionTime
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
        vin {
          txid
          vout
          scriptsig
          scriptsigAsm
          isCoinbase
          sequence
          prevout {
            status {
              spent
              txid
              vin
            }
            scriptpubkey
            scriptpubkeyAsm
            scriptpubkeyType
            scriptpubkeyAddress
            value
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

export default withI18n<{ hashOrHeight: string }>(async function Page({ params: { hashOrHeight } }, { i18n }) {
  const data = await graphQLClient.request(query, { hashOrHeight })

  if (!data?.btcBlock) notFound()

  return (
    <VStack w="100%" gap="30px">
      {data.btcBlock?.transactions?.map((tx) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={tx.txid}>
            <TransactionHeaderInAddress time={tx.transactionTime} txid={tx.txid} btcTime />
            <BtcUtxoTables txid={tx.txid} vin={tx.vin as BitcoinInput[]} vout={tx.vout as BitcoinOutput[]} />
            <UtxoOrCellFooter fee={tx.fee} feeRate={tx.feeRate} feeUnit={t(i18n)`sats`}>
              <HStack gap="16px" flexWrap="wrap" justify={{ base: 'start', lg: 'end' }}>
                <BtcOutputsSum vout={tx.vout as BitcoinOutput[]} />
              </HStack>
            </UtxoOrCellFooter>
          </VStack>
        )
      })}
    </VStack>
  )
})
