'use client'

import { Trans } from '@lingui/macro'
import { useEffect, useRef } from 'react'
import { Box, Flex } from 'styled-system/jsx'
import Typed from 'typed.js'

import { Heading } from '@/components/ui'

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
      mb="54px"
      fontSize="62px"
      fontWeight="semibold"
      lineHeight="100px"
      display="flex"
      alignItems="center"
    >
      <Trans>
        Explore the
        <Flex display="flex" alignItems="center" w="240px" mx="20px" h="100px" justify="center">
          <Box ref={el} display="inline-block" h="100px" />
        </Flex>
        Ecosystem
      </Trans>
    </Heading>
  )
}
