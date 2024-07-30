'use client'

import { Trans } from '@lingui/macro'
import { Box, HStack } from 'styled-system/jsx'

import ArrowIcon from '@/assets/arrow-2.svg'
import BtcIcon from '@/assets/chains/btc.svg'
import CkbIcon from '@/assets/chains/ckb.svg'
import { iife } from '@/lib/iife'

export interface LayerTypeProps {
  type?: 'l1' | 'l2' | 'l1-l2' | 'l2-l1'
}

export function LayerType({ type }: LayerTypeProps) {
  if (!type) return null
  return (
    <HStack gap="6px" fontSize="14px">
      {iife(() => {
        switch (type) {
          case 'l1':
            return (
              <>
                <BtcIcon w="20px" h="20px" />
                <Box>
                  <Trans>L1</Trans>
                </Box>
              </>
            )
          case 'l2':
            return (
              <>
                <CkbIcon w="20px" h="20px" />
                <Box>
                  <Trans>L2</Trans>
                </Box>
              </>
            )
          case 'l1-l2':
            return (
              <>
                <BtcIcon w="20px" h="20px" />
                <Box>
                  <Trans>L1</Trans>
                </Box>
                <ArrowIcon w="12px" />
                <CkbIcon w="20px" h="20px" />
                <Box>
                  <Trans>L2</Trans>
                </Box>
              </>
            )
          case 'l2-l1':
            return (
              <>
                <CkbIcon w="20px" h="20px" />
                <Box>
                  <Trans>L2</Trans>
                </Box>
                <ArrowIcon w="12px" />
                <BtcIcon w="20px" h="20px" />
                <Box>
                  <Trans>L1</Trans>
                </Box>
              </>
            )
          default:
            return null
        }
      })}
    </HStack>
  )
}
