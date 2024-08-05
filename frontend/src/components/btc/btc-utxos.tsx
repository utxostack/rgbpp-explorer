import { t } from '@lingui/macro'
import { Flex, HStack, VStack } from 'styled-system/jsx'

import { BtcTransaction } from '@/apis/types/explorer-graphql'
import BtcIcon from '@/assets/chains/btc.svg'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { ViewMemPool } from '@/components/view-mempool'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export function BtcUtxos({
  txid,
  vin,
  vout,
  isBinding,
}: Pick<BtcTransaction, 'txid' | 'vin' | 'vout'> & {
  isBinding?: boolean
}) {
  const i18n = getI18nFromHeaders()
  return (
    <VStack w="100%" gap={0} bg="bg.card" rounded="8px">
      <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
        <HStack gap="16px">
          <BtcIcon h="40px" w="40px" />
          {isBinding ? (
            <VStack alignItems="start" gap={0}>
              <Text fontSize="16px" fontWeight="semibold">{t(i18n)`RGB++ Binding Txn on BTC`}</Text>
              <Link
                href={`/transaction/${txid}`}
                color="brand"
                fontSize="14px"
                _hover={{
                  textDecoration: 'underline',
                }}
              >
                {txid}
              </Link>
            </VStack>
          ) : (
            <Text fontSize="16px" fontWeight="semibold">{t(i18n)`BTC Txn`}</Text>
          )}
        </HStack>
        <ViewMemPool txid={txid} />
      </Flex>
      <BtcUtxoTables vin={vin} vout={vout} />
    </VStack>
  )
}
