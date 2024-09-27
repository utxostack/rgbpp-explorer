'use client'

import { t } from '@lingui/macro'
import { VStack } from 'styled-system/jsx'

import ComingSoonSVG from '@/assets/coming-soon.svg'
import { Text } from '@/components/ui'

export default function Page() {
  return (
    <VStack gap="10px" w="100%" bg="bg.card" maxW="content" p="30px" rounded="8px" pt="74px" pb="260px">
      <ComingSoonSVG w="200px" h="200px" />
      <Text color="text.third" fontSize="14px">{t`Coming soon, please stay tuned`}</Text>
    </VStack>
  )
}
