import { t } from '@lingui/macro'
import { notFound } from 'next/navigation'
import { Flex, VStack } from 'styled-system/jsx'

import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { TimeFormatter } from '@/components/time-formatter'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { graphql } from '@/gql'
import { BitcoinInput, BitcoinOutput } from '@/gql/graphql'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'
import { formatNumber } from '@/lib/string/format-number'

const query = graphql(`
  query BtcBlockTransaction($hashOrHeight: String!) {
    btcBlock(hashOrHeight: $hashOrHeight) {
      transactions {
        blockHeight
        blockHash
        txid
        version
        size
        locktime
        weight
        fee
        confirmed
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

export default async function Page({ params: { hashOrHeight } }: { params: { hashOrHeight: string } }) {
  const i18n = getI18nFromHeaders()
  const data = await graphQLClient.request(query, { hashOrHeight })

  if (!data?.btcBlock) notFound()

  return (
    <VStack w="100%" gap="30px">
      {data.btcBlock?.transactions.map((transaction) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={transaction.txid}>
            <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
              <Link href={`/transaction/${transaction.txid}`} fontSize="14px" fontWeight="medium" color="brand">
                {transaction.txid}
              </Link>
              {transaction.locktime ? <TimeFormatter timestamp={transaction.locktime} /> : null}
            </Flex>
            <BtcUtxoTables vin={transaction.vin as BitcoinInput[]} vout={transaction.vout as BitcoinOutput[]} />
            <Flex h="72px" px="30px" w="100%" alignItems="center" borderTop="1px solid" borderTopColor="border.primary">
              <Text as="span" fontSize="14px" color="text.third">
                {t(i18n)`Txn fee: `}{' '}
                <Text as="span" color="text.primary" fontWeight="semibold">
                  {formatNumber(transaction.fee)}{' '}
                </Text>
                {t(i18n)`sats`}
              </Text>
            </Flex>
          </VStack>
        )
      })}
    </VStack>
  )
}
