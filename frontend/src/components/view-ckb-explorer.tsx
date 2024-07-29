'use client'

import { Trans } from '@lingui/macro'

import CkbIcon from '@/assets/chains/ckb.svg'
import { Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { resolveCkbExplorerUrl } from '@/lib/ckb/resolve-ckb-explorer-url'

export function ViewCkbExplorer({ txHash }: { txHash: string }) {
  return (
    <Link
      href={resolveCkbExplorerUrl(txHash, 'transaction')}
      target="_blank"
      display="flex"
      alignItems="center"
      justifyContent="start"
      gap="8px"
      py="8px"
      px="16px"
      rounded="4px"
      bg="bg.primary"
    >
      <CkbIcon h="18px" w="18px" />
      <Text fontSize="14px" fontWeight="semibold">
        <Trans>View Details in CKB</Trans>
      </Text>
    </Link>
  )
}
