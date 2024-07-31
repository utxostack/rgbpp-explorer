'use client'

import { Trans } from '@lingui/macro'

import { Heading, Text } from '@/components/ui'

export function HomeTitle() {
  return (
    <Heading mt="10%" mb="54px" fontSize="62px" fontWeight="semibold">
      <Trans>
        Explore the
        <Text as="span" color="#F7931A" mx="4px">
          BTC
        </Text>
        Ecosystem
      </Trans>
    </Heading>
  )
}
