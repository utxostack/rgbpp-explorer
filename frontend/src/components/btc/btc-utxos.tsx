import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Flex, HStack, VStack } from 'styled-system/jsx'

import { BtcTransaction } from '@/apis/types/explorer-graphql'
import BtcIcon from '@/assets/chains/btc.svg'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { Text } from '@/components/ui'
import { ViewMemPool } from '@/components/view-mempool'

export function BtcUtxos({ txid, vin, vout }: Pick<BtcTransaction, 'txid' | 'vin' | 'vout'>) {
  return (
    <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
      <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
        <HStack gap="16px">
          <BtcIcon h="40px" w="40px" />
          <Text fontSize="16px" fontWeight="semibold">{t(i18n)`BTC Txn`}</Text>
        </HStack>
        <ViewMemPool txid={txid} />
      </Flex>
      <BtcUtxoTables vin={vin} vout={vout} />
    </VStack>
  )
}
