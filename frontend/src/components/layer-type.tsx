import { t } from '@lingui/macro'
import { Box, HStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import ArrowIcon from '@/assets/arrow-2.svg'
import BtcIcon from '@/assets/chains/btc.svg'
import CkbIcon from '@/assets/chains/ckb.svg'
import { iife } from '@/lib/iife'

export interface LayerTypeProps {
  type: 'l1' | 'l2' | 'l1-l2' | 'l2-l1'
}

export function LayerType({ type }: LayerTypeProps) {
  const i18n = getI18nFromHeaders()

  return (
    <HStack gap="6px" fontSize="14px">
      {iife(() => {
        switch (type) {
          case 'l1':
            return (
              <>
                <BtcIcon w="20px" h="20px" />
                <Box>{t(i18n)`L1`}</Box>
              </>
            )
          case 'l2':
            return (
              <>
                <CkbIcon w="20px" h="20px" />
                <Box>{t(i18n)`L2`}</Box>
              </>
            )
          case 'l1-l2':
            return (
              <>
                <BtcIcon w="20px" h="20px" />
                <Box>{t(i18n)`L1`}</Box>
                <ArrowIcon w="12px" />
                <CkbIcon w="20px" h="20px" />
                <Box>{t(i18n)`L2`}</Box>
              </>
            )
          case 'l2-l1':
            return (
              <>
                <CkbIcon w="20px" h="20px" />
                <Box>{t(i18n)`L2`}</Box>
                <ArrowIcon w="12px" />
                <BtcIcon w="20px" h="20px" />
                <Box>{t(i18n)`L1`}</Box>
              </>
            )
          default:
            return null
        }
      })}
    </HStack>
  )
}
