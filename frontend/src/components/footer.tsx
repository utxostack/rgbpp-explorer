import { t } from '@lingui/macro'
import { Center, Flex, Grid, HStack, VStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import LogoSVG from '@/assets/logo.svg'
import DiscordSVG from '@/assets/social-medias/discord.svg'
import MIcon from '@/assets/social-medias/m.svg'
import TwitterSVG from '@/assets/social-medias/x.svg'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'

export function Footer() {
  const i18n = getI18nFromHeaders()
  return (
    <Center w="100%" bg="bg.card" mt="auto">
      <Flex maxW="content" justifyContent="space-between" w="100%" px="30px" py="40px">
        <Grid gridTemplateColumns="56px 1fr" gridTemplateRows="56px 48px" gridColumnGap="12px" gridRowGap="24px">
          <Link href="/">
            <LogoSVG />
          </Link>
          <Text fontWeight="semibold" fontSize="24px" lineHeight="56px">{t(i18n)`RGB++ Explorer`}</Text>
          <HStack gridColumn="2/3" gap="28px">
            <Link
              rounded="100%"
              border="1px solid"
              borderColor="border.light"
              w="48px"
              h="48px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              href="/"
              target="_blank"
              transition="200ms"
              _hover={{
                color: 'brand',
                borderColor: 'brand',
              }}
            >
              <TwitterSVG w="32px" h="32px" />
            </Link>
            <Link
              rounded="100%"
              border="1px solid"
              borderColor="border.light"
              w="48px"
              h="48px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              href="/"
              target="_blank"
              transition="200ms"
              _hover={{
                color: 'brand',
                borderColor: 'brand',
              }}
            >
              <DiscordSVG w="32px" h="32px" />
            </Link>
            <Link
              rounded="100%"
              border="1px solid"
              borderColor="border.light"
              w="48px"
              h="48px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              href="/"
              target="_blank"
              transition="200ms"
              _hover={{
                color: 'brand',
                borderColor: 'brand',
              }}
            >
              <MIcon w="32px" h="32px" />
            </Link>
          </HStack>
        </Grid>
        <HStack gap="134px" whiteSpace="nowrap" alignItems="start">
          <VStack w="100%" gap="30px" alignItems="start">
            <Heading fontSize="18px">{t(i18n)`Explorer`}</Heading>
            <VStack w="100%" gap="16px" color="text.third" alignItems="start">
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Bitcoin`}
              </Link>
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`CKB`}
              </Link>
            </VStack>
          </VStack>
          <VStack w="100%" gap="30px" alignItems="start">
            <Heading fontSize="18px">{t(i18n)`RGB++`}</Heading>
            <VStack w="100%" gap="16px" color="text.third" alignItems="start">
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Whitepaper`}
              </Link>
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Script`}
              </Link>
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`SDK`}
              </Link>
            </VStack>
          </VStack>
          <VStack w="100%" gap="30px" alignItems="start">
            <Heading fontSize="18px">{t(i18n)`More Info`}</Heading>
            <VStack w="100%" gap="16px" color="text.third" alignItems="start">
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Nervos CKB`}
              </Link>
              <Link href="/" _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`UTXO Stack`}
              </Link>
            </VStack>
          </VStack>
        </HStack>
      </Flex>
    </Center>
  )
}
