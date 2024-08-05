'use client'

import { Trans } from '@lingui/macro'
import { useEffect } from 'react'
import { Center } from 'styled-system/jsx'

import ErrorPageSVG from '@/assets/error-page.svg'
import { Button, Text } from '@/components/ui'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Center flexDir="column" flex={1} bg="bg.card" maxW="content" w="100%" my="30px" p="30px">
      <ErrorPageSVG w="200px" h="200px" />
      <Text
        fontSize="14px"
        fontWeight="medium"
        color="text.third"
        mb="24px"
        maxH="200px"
        overflowY="auto"
        overflowX="hidden"
        maxW="100%"
        textAlign="center"
      >
        <Trans>Something wrong. Error code: {error.digest}</Trans>
      </Text>
      <Button size="sm" onClick={reset}>
        <Trans>Try again</Trans>
      </Button>
    </Center>
  )
}
