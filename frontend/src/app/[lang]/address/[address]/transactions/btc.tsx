import { t } from '@lingui/macro'
import { Flex, VStack } from 'styled-system/jsx'

import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { Copier } from '@/components/copier'
import { FailedFallback } from '@/components/failed-fallback'
import { TimeFormatter } from '@/components/time-formatter'
import Link from '@/components/ui/link'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { graphql } from '@/gql'
import { BitcoinInput, BitcoinOutput } from '@/gql/graphql'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { graphQLClient } from '@/lib/graphql'

const query = graphql(`
  query BtcTransactionByAddress($address: String!) {
    btcAddress(address: $address) {
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
`)

export async function BtcTransactionsByAddress({ address }: { address: string }) {
  const i18n = getI18nFromHeaders()
  const { btcAddress } = await graphQLClient.request(query, {
    address,
    page: 1,
    pageSize: 10,
  })

  if (!btcAddress) {
    return <FailedFallback />
  }

  return btcAddress.transactions.map((tx) => {
    return (
      <VStack key={tx.txid} w="100%" gap={0} bg="bg.card" rounded="8px">
        <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
          <Copier value={tx.txid} onlyIcon>
            <Link color="brand" href={`/transaction/${tx.txid}`}>
              {tx.txid}
            </Link>
          </Copier>
          {tx.locktime > 500000000 ? <TimeFormatter timestamp={resolveBtcTime(tx.locktime)} /> : null}
        </Flex>
        <BtcUtxoTables vin={tx.vin as BitcoinInput[]} vout={tx.vout as BitcoinOutput[]} currentAddress={address} />
        <UtxoOrCellFooter
          fee={tx.fee}
          confirmations={tx.confirmations}
          feeRate={tx.feeRate}
          feeUnit={t(i18n)`sats`}
          address={address}
        />
      </VStack>
    )
  })
}
