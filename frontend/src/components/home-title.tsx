'use client'

import { Trans } from '@lingui/macro'
import { useEffect, useRef } from 'react'
import { Box, Flex } from 'styled-system/jsx'
import Typed from 'typed.js'

import { Heading, Text } from '@/components/ui'

export function HomeTitle() {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        '<span style="color: #F7931A">BTC</span>',
        'RGB++',
        '<span style="color: var(--colors-brand)">UTXO</span>',
      ],
      typeSpeed: 80,
      backSpeed: 100,
      loop: true,
    })

    return () => {
      typed.destroy()
    }
  }, [])

  return (
    <Heading
      mt="10%"
      fontSize={{ base: '30px', sm: '54px', xl: '62px' }}
      fontWeight="semibold"
      lineHeight={{ base: '32px', sm: '62px', xl: '100px' }}
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      textAlign="center"
      justifyContent="center"
      whiteSpace="nowrap"
    >
      <Trans>
        <Flex alignItems="center">
          Explore the
          <Flex
            display="flex"
            alignItems="center"
            w={{ base: '100px', sm: '200px', xl: '240px' }}
            mx="20px"
            h={{ base: '32px', sm: '62px', xl: '100px' }}
            justify="center"
          >
            <Box ref={el} display="inline-block" h={{ base: '32px', sm: '62px', xl: '100px' }} />
          </Flex>
        </Flex>
        <Text as="span" display="block" w={{ base: '100%', md: 'auto' }}>
          Ecosystem
        </Text>
      </Trans>
    </Heading>
  )
}
