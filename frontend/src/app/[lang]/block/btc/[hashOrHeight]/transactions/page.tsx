import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Flex, VStack } from 'styled-system/jsx'

import { explorerGraphql } from '@/apis/explorer-graphql'
import { BtcUtxoTables } from '@/components/btc/btc-utxo-tables'
import { TimeFormatter } from '@/components/time-formatter'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { formatNumber } from '@/lib/string/format-number'

export default async function Page({ params: { hashOrHeight } }: { params: { hashOrHeight: string } }) {
  const data = await explorerGraphql.getBtcBlockTransaction(hashOrHeight)

  return (
    <VStack w="100%" gap="30px">
      {data.btcBlock.transactions.map((transaction) => {
        return (
          <VStack w="100%" gap={0} bg="bg.card" rounded="8px" key={transaction.txid}>
            <Flex w="100%" bg="bg.input" justifyContent="space-between" py="20px" px="30px" roundedTop="8px">
              <Link href={`/transaction/${transaction.txid}`} fontSize="16px" fontWeight="semibold" color="brand">
                {transaction.txid}
              </Link>
              {transaction.locktime ? <TimeFormatter timestamp={transaction.locktime} /> : null}
            </Flex>
            <BtcUtxoTables vin={transaction.vin} vout={transaction.vout} />
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
