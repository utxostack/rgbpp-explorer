import { Flex, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { CkbCellTables } from '@/components/ckb/ckb-cell-tables'
import { Copier } from '@/components/copier'
import { FailedFallback } from '@/components/failed-fallback'
import { TimeFormatter } from '@/components/time-formatter'
import Link from '@/components/ui/link'
import { UtxoOrCellFooter } from '@/components/utxo-or-cell-footer'

export async function CkbTransactionsByAddress({ address }: { address: string }) {
  const { ckbAddress } = await explorerGraphql.getCkbTransactionByAddress(address)

  if (!ckbAddress) {
    return <FailedFallback />
  }

  return ckbAddress.transactions.map((tx) => {
    return (
      <VStack key={tx.hash} w="100%" gap={0} bg="bg.card" rounded="8px">
        <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
          <Copier value={tx.hash} onlyIcon>
            <Link color="brand" href={`/transaction/${tx.hash}`}>
              {tx.hash}
            </Link>
          </Copier>
          {tx.block ? <TimeFormatter timestamp={tx.block.timestamp} /> : null}
        </Flex>
        <CkbCellTables inputs={tx.inputs} outputs={tx.outputs} />
        <UtxoOrCellFooter fee={tx.fee} confirmations={tx.confirmations} feeRate={tx.feeRate} />
      </VStack>
    )
  })
}
