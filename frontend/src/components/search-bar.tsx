'use client'

import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Flex, type FlexProps, styled } from 'styled-system/jsx'

import SearchIcon from '@/assets/search.svg'

export function SearchBar(props: FlexProps) {
  const { i18n } = useLingui()
  return (
    <Flex w="100%" maxW="812px" h="64px" p="6px" bg="rgba(255, 255, 255, 0.9)" rounded="100px" {...props}>
      <styled.input
        flex={1}
        placeholder={t(i18n)`Search by Address/Tx Hash/Block Hash`}
        pl="20px"
        color="bg.primary"
        fontWeight="medium"
        fontSize="md"
        _placeholder={{
          color: 'text.third',
        }}
        _focus={{ boxShadow: 'none', outline: 'none' }}
      />
      <styled.button bg="#000" px="20px" h="100%" rounded="full" cursor="pointer">
        <SearchIcon w="38px" h="38px" />
      </styled.button>
    </Flex>
  )
}

export function SearchBarInNav(props: FlexProps) {
  const { i18n } = useLingui()
  return (
    <Flex bg="bg.input" h="44px" rounded="100px" w="500px" {...props}>
      <styled.input
        flex={1}
        placeholder={t(i18n)`Search by Address/Tx Hash/Block Hash`}
        pl="20px"
        color="text.primary"
        fontWeight="medium"
        fontSize="md"
        _placeholder={{
          color: 'text.third',
        }}
        _focus={{ boxShadow: 'none', outline: 'none' }}
      />
      <styled.button bg="brand" px="20px" h="calc(100% - 8px)" rounded="full" cursor="pointer" m="4px">
        <SearchIcon w="24px" h="24px" />
      </styled.button>
    </Flex>
  )
}
