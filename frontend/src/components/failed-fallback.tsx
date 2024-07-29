'use client'

import { Trans } from '@lingui/macro'
import { VStack } from 'styled-system/jsx'

import FailedSVG from '@/assets/failed.svg'
import { Text } from '@/components/ui'

export function FailedFallback() {
  return (
    <VStack gap={0} textAlign="center">
      <FailedSVG w="200px" h="200px" />
      <Text fontSize="14px" fontWeight="semibold" color="text.third">
        <Trans>Loading failed, please wait</Trans>
      </Text>
    </VStack>
  )
}
