'use client'

import { Trans } from '@lingui/macro'

import ComingSoonSVG from '@/assets/coming-soon.svg'
import { Text } from '@/components/ui'

import { VStack } from 'styled-system/jsx'

export function ComingSoon() {
  return (
    <VStack gap="10px" w="100%" bg="bg.card" maxW="content" p="30px" rounded="8px" pt="74px" pb="260px">
      <ComingSoonSVG w="200px" h="200px" />
      <Text color="text.third" fontSize="14px">
        <Trans>Coming soon, please stay tuned</Trans>
      </Text>
    </VStack>
  )
}
