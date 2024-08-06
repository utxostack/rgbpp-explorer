'use client'

import { Trans } from '@lingui/macro'
import { VStack } from 'styled-system/jsx'

import NoDataSVG from '@/assets/no-data.svg'
import { Text } from '@/components/ui'

export function NoData({ children }: { children?: React.ReactNode }) {
  return (
    <VStack gap={0} textAlign="center">
      <NoDataSVG w="200px" h="200px" />
      <Text fontSize="14px" fontWeight="semibold" color="text.third">
        {children ?? <Trans>No Data</Trans>}
      </Text>
    </VStack>
  )
}
