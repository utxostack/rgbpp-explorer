'use client'

import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Flex, VStack } from 'styled-system/jsx'

import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { Copier } from '@/components/copier'
import { TimeFormatter } from '@/components/time-formatter'
import Link from '@/components/ui/link'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'
import { BitcoinInput, BitcoinOutput, BitcoinTransaction } from '@/gql/graphql'
import { resolveBtcTime } from '@/lib/btc/resolve-btc-time'

export function BtcTransactionCardInAddress({ tx, address }: { tx: BitcoinTransaction; address: string }) {
  const { i18n } = useLingui()
  return (
    <VStack key={tx.txid} w="100%" gap={0} bg="bg.card" rounded="8px">
      <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
        <Copier value={tx.txid} onlyIcon>
          <Link color="brand" href={`/transaction/${tx.txid}`}>
            {tx.txid}
          </Link>
        </Copier>
        {tx.transactionTime ? <TimeFormatter timestamp={resolveBtcTime(tx.transactionTime)} /> : null}
      </Flex>
      <BtcUtxoTables vin={tx.vin as BitcoinInput[]} vout={tx.vout as BitcoinOutput[]} currentAddress={address} />
      <UtxoOrCellFooter
        fee={tx.fee}
        confirmations={tx.confirmations}
        feeRate={tx.feeRate}
        feeUnit={t(i18n)`sats`}
        address={address}
        btcUtxo={{ vin: tx.vin as BitcoinInput[], vout: tx.vout as BitcoinOutput[] }}
      />
    </VStack>
  )
}
