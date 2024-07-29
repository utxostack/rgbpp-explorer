import { explorerGraphql } from '@/apis/explorer-graphql'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { Copier } from '@/components/copier'
import { FailedFallback } from '@/components/failed-fallback'
import { TimeFormatter } from '@/components/time-formatter'
import Link from '@/components/ui/link'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'

import { Flex, VStack } from '../../../../../../styled-system/jsx'

export async function BtcTransactionsByAddress({ address }: { address: string }) {
  const { btcAddress } = await explorerGraphql.getBtcTransactionsByAddress(address)

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
          <TimeFormatter timestamp={tx.locktime} />
        </Flex>
        <BtcUtxoTables vin={tx.vin} vout={tx.vout} />
        <UtxoOrCellFooter fee={tx.fee} confirmations={tx.confirmations} feeRate={tx.feeRate} />
      </VStack>
    )
  })
}
