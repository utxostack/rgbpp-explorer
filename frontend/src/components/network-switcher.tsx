'use client'

import { Trans } from '@lingui/macro'
import { memo } from 'react'
import { Box, Flex, VStack } from 'styled-system/jsx'

import ArrowDownIcon from '@/assets/arrow-down.svg'
import MainnetSVG from '@/assets/mainnet.svg'
import TestnetSVG from '@/assets/testnet.svg'
import { HoverCard, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { env } from '@/constants/env'

export const NetworkSwitcher = memo(function NetworkSwitcher() {
  const networks = [
    {
      icon: <MainnetSVG w="24px" h="24px" />,
      label: <Trans>Mainnet</Trans>,
      href: env.public.RGBPP_EXPLORER_MAINNET_URL,
    },
    {
      icon: <TestnetSVG w="24px" h="24px" />,
      label: <Trans>Testnet</Trans>,
      href: env.public.RGBPP_EXPLORER_TESTNET_URL,
    },
  ]
  const network = env.public.IS_MAINNET ? networks[0] : networks[1]

  return (
    <HoverCard.Root unmountOnExit openDelay={0} closeDelay={200}>
      <HoverCard.Trigger asChild>
        <Flex align="center" color="brand" cursor="default">
          <Text as="span" mr="8px">
            {network.icon}
          </Text>
          {network.label}
          <ArrowDownIcon w="16px" h="16px" ml="12px" />
        </Flex>
      </HoverCard.Trigger>

      <HoverCard.Positioner>
        <HoverCard.Content w="200px">
          <HoverCard.Arrow>
            <HoverCard.ArrowTip />
          </HoverCard.Arrow>
          <VStack gap="16px" w="100%">
            {networks.map((x, i) => {
              return (
                <Link
                  href={x.href}
                  p="6px"
                  key={i}
                  gap="8px"
                  display="flex"
                  alignItems="center"
                  rounded="100px"
                  w="100%"
                  border="1px solid"
                  borderColor="transparent"
                  transition="100ms"
                  _hover={{
                    bg: 'bg.input',
                    borderColor: 'border.light',
                  }}
                  css={{
                    '&:hover .arrow': {
                      opacity: 1,
                    },
                  }}
                >
                  <Text as="span" color={network === x ? 'brand' : 'text.primary'}>
                    {x.icon}
                  </Text>
                  {x.label}
                  {network === x ? (
                    <Box w="8px" h="8px" my="auto" mr="6px" ml="auto" bg="#2FE000" rounded="100%" />
                  ) : null}
                </Link>
              )
            })}
          </VStack>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  )
})
