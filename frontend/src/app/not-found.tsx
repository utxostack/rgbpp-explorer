'use client'

import { Trans } from '@lingui/macro'
import { Center } from 'styled-system/jsx'

import NotFoundSVG from '@/assets/not-found.svg'
import { Button, Text } from '@/components/ui'
import Link from '@/components/ui/link'

export default function NotFound() {
  return (
    <Center flexDir="column" flex={1} bg="bg.card" maxW="content" w="100%" my="30px" p="30px">
      <NotFoundSVG w="200px" h="200px" />
      <Text fontSize="14px" fontWeight="medium" color="text.third" mb="24px">
        <Trans>Sorry, the page you visited does not exist</Trans>
      </Text>
      <Link href="/">
        <Button size="sm">
          <Trans>Back to Home</Trans>
        </Button>
      </Link>
    </Center>
  )
}
