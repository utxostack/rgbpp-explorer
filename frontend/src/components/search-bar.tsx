'use client'

import { t, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { Center, Flex, type FlexProps, styled, VStack } from 'styled-system/jsx'
import { useDebounceCallback } from 'usehooks-ts'

import SearchIcon from '@/assets/search.svg'
import SearchFailedSVG from '@/assets/search-failed.svg'
import { Loading } from '@/components/loading'
import { HoverCard, Text } from '@/components/ui'
import { graphql } from '@/gql'
import { graphQLClient } from '@/lib/graphql'

function SearchResult({
  children,
  open,
  error,
  isLoading,
  maxW = '812px',
}: {
  open: boolean
  isLoading: boolean
  error: boolean
  children: ReactNode
  maxW?: string
}) {
  return (
    <HoverCard.Root open={open ? error || isLoading : false} positioning={{ placement: 'bottom' }}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Positioner>
        <HoverCard.Content w="100vw" maxW={maxW} py="50px" zIndex={10}>
          <HoverCard.Arrow>
            <HoverCard.ArrowTip />
          </HoverCard.Arrow>
          {isLoading ? (
            <Center w="100%" h="220px">
              <Loading />
            </Center>
          ) : (
            <VStack>
              <SearchFailedSVG w="200px" />
              <Text fontSize="14px" h="20px" fontWeight="medium" color="text.third">
                <Trans>Oops! Your search did not match any record.</Trans>
              </Text>
            </VStack>
          )}
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  )
}

function useSearch() {
  const router = useRouter()
  return useMutation({
    async mutationFn(keyword: string) {
      const { search } = await graphQLClient.request(
        graphql(`
          query Search($keyword: String!) {
            search(query: $keyword) {
              query
              btcBlock
              btcTransaction
              btcAddress
              ckbBlock
              ckbTransaction
              ckbAddress
              rgbppCoin
            }
          }
        `),
        {
          keyword,
        },
      )
      if (search.rgbppCoin) {
        return router.push(`/assets/coins/${search.rgbppCoin}`)
      }
      if (search.ckbTransaction) {
        return router.push(`/transaction/${search.ckbTransaction}`)
      }
      if (search.btcTransaction) {
        return router.push(`/transaction/${search.btcTransaction}`)
      }
      if (search.btcAddress) {
        return router.push(`/address/${search.btcAddress}`)
      }
      if (search.ckbAddress) {
        return router.push(`/address/${search.ckbAddress}`)
      }
      if (search.ckbBlock) {
        return router.push(`/block/btc/${search.ckbBlock}`)
      }
      if (search.btcBlock) {
        return router.push(`/block/btc/${search.btcBlock}`)
      }
      throw new Error('Not found')
    },
  })
}

export function SearchBar(props: FlexProps) {
  const { i18n } = useLingui()
  const { mutate, isPending, error } = useSearch()
  const [value, setValue] = useState<string>('')
  const onInput = useDebounceCallback((keyword: string) => mutate(keyword), 300)
  const [isFocus, setFocus] = useState(false)

  return (
    <SearchResult isLoading={isPending} error={!!error} open={isFocus ? !!value : false}>
      <Flex w="100%" maxW="812px" h="64px" p="6px" bg="rgba(255, 255, 255, 0.9)" rounded="100px" {...props}>
        <styled.input
          flex={1}
          placeholder={t(i18n)`Search by Address/Tx Hash/Block Hash/AssetID`}
          pl="20px"
          color="bg.primary"
          fontWeight="medium"
          fontSize="md"
          _placeholder={{
            color: 'text.third',
          }}
          _focus={{ boxShadow: 'none', outline: 'none' }}
          onChange={(e) => {
            onInput(e.target.value)
            setValue(e.target.value)
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        <styled.button bg="#000" px="20px" h="100%" rounded="full" cursor="pointer">
          <SearchIcon w="38px" h="38px" />
        </styled.button>
      </Flex>
    </SearchResult>
  )
}

export function SearchBarInNav(props: FlexProps) {
  const { i18n } = useLingui()
  const { mutate, isPending, error } = useSearch()
  const [value, setValue] = useState<string>('')
  const onInput = useDebounceCallback((keyword: string) => mutate(keyword), 300)
  const [isFocus, setFocus] = useState(false)

  return (
    <SearchResult maxW="500px" isLoading={isPending} error={!!error} open={isFocus ? !!value : false}>
      <Flex bg="bg.input" h="44px" rounded="100px" w="500px" {...props}>
        <styled.input
          flex={1}
          placeholder={t(i18n)`Search by Address/Tx Hash/Block Hash/AssetID`}
          fontSize="14px"
          pl="20px"
          color="text.primary"
          fontWeight="medium"
          _placeholder={{
            color: 'text.third',
          }}
          _focus={{ boxShadow: 'none', outline: 'none' }}
          onChange={(e) => {
            onInput(e.target.value)
            setValue(e.target.value)
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        <styled.button bg="brand" px="20px" h="calc(100% - 8px)" rounded="full" cursor="pointer" m="4px">
          <SearchIcon w="24px" h="24px" />
        </styled.button>
      </Flex>
    </SearchResult>
  )
}
