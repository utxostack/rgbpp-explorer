'use client'

import { Trans } from '@lingui/macro'

import MemPoolIcon from '@/assets/mempool.svg'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { resolveMempool } from '@/lib/btc/resolve-mempool'

export function ViewMemPool({ txid }: { txid: string }) {
  return (
    <Link
      href={resolveMempool(txid, 'tx')}
      target="_blank"
      display="flex"
      alignItems="center"
      justifyContent="start"
      gap="8px"
      py="8px"
      px="16px"
      rounded="4px"
      bg="bg.primary"
      w="fit-content"
    >
      <MemPoolIcon h="18px" w="18px" />
      <Text fontSize="14px" fontWeight="semibold">
        <Trans>View Details in Mempool</Trans>
      </Text>
    </Link>
  )
}
