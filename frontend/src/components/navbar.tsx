'use client'

import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { usePathname } from 'next/navigation'
import { Center, Flex, HStack, VStack } from 'styled-system/jsx'

import ArrowIcon from '@/assets/arrow.svg'
import ArrowDownIcon from '@/assets/arrow-down.svg'
import BtcIcon from '@/assets/chains/btc.svg'
import CkbIcon from '@/assets/chains/ckb.svg'
import LogoSVG from '@/assets/logo.svg'
import { IfPathname } from '@/components/if-pathname'
import { NetworkSwitcher } from '@/components/network-switcher'
import { SearchBarInNav } from '@/components/search-bar'
import { HoverCard, Text } from '@/components/ui'
import { Link } from '@/components/ui/link'

export function Navbar() {
  const pathname = usePathname()
  const {
    i18n: { locale },
  } = useLingui()
  return (
    <Center bg="bg.card" w="100%" px="30px" pos="sticky" top="0" zIndex="50">
      <Flex maxW="1280px" w="100%" h="80px" alignItems="center" justifyContent="space-between">
        <HStack gap="48px" fontWeight="medium">
          <Link display="flex" href="/" gap="8px" alignItems="center" pr="32px">
            <LogoSVG w="40px" h="40px" />
            <Text fontWeight="semibold" size="xl">
              <Trans>RGB++ Explorer</Trans>
            </Text>
          </Link>
          <HoverCard.Root unmountOnExit openDelay={0} closeDelay={200}>
            <HoverCard.Trigger asChild>
              <Flex
                align="center"
                gap="12px"
                cursor="default"
                color={pathname.startsWith(`/${locale}/explorer`) ? 'brand' : 'text.primary'}
              >
                <Trans>Explorer</Trans>
                <ArrowDownIcon w="16px" h="16px" />
              </Flex>
            </HoverCard.Trigger>

            <HoverCard.Positioner>
              <HoverCard.Content w="200px">
                <HoverCard.Arrow>
                  <HoverCard.ArrowTip />
                </HoverCard.Arrow>
                <VStack gap="16px" w="100%">
                  {[
                    {
                      label: <Trans>Bitcoin</Trans>,
                      icon: <BtcIcon minW="24px" w="24px" h="24px" />,
                      href: '/explorer/btc',
                    },
                    {
                      label: <Trans>CKB</Trans>,
                      icon: <CkbIcon minW="24px" w="24px" h="24px" />,
                      href: '/explorer/ckb',
                    },
                  ].map((x, i) => {
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
                        {x.icon}
                        {x.label}
                        <ArrowIcon
                          ml="auto"
                          mr="6px"
                          w="12px"
                          minW="12px"
                          className="arrow"
                          opacity={0}
                          transition="100ms"
                        />
                      </Link>
                    )
                  })}
                </VStack>
              </HoverCard.Content>
            </HoverCard.Positioner>
          </HoverCard.Root>

          <Link
            href="/assets"
            _hover={{ textDecoration: 'underline' }}
            color={pathname.startsWith(`/${locale}/assets`) ? 'brand' : 'text.primary'}
          >
            <Trans>RGB++ Assets</Trans>
          </Link>
        </HStack>
        <HStack gap="20px">
          <IfPathname isNotOneOf={['/']} exact>
            <SearchBarInNav ml="auto" />
          </IfPathname>
          <NetworkSwitcher />
        </HStack>
      </Flex>
    </Center>
  )
}
