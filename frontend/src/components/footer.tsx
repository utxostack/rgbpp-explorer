import { t } from '@lingui/macro'
import { Center, Flex, Grid, HStack, VStack } from 'styled-system/jsx'

import LogoSVG from '@/assets/logo.svg'
import GithubSVG from '@/assets/social-medias/github.svg'
import MediumIcon from '@/assets/social-medias/medium.svg'
import TwitterSVG from '@/assets/social-medias/x.svg'
import { Heading, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { env } from '@/constants/env'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export function Footer() {
  const i18n = getI18nFromHeaders()
  const socialMedias = [
    {
      href: env.public.UTXO_STACK_TWITTER_URL,
      icon: <TwitterSVG w={{ base: '24px', lg: '32px' }} h={{ base: '24px', lg: '32px' }} />,
    },
    {
      href: env.public.CKB_CELL_GITHUB_URL,
      icon: <GithubSVG w={{ base: '24px', lg: '32px' }} h={{ base: '24px', lg: '32px' }} />,
    },
    {
      href: env.public.UTXO_STACK_MEDIUM_URL,
      icon: <MediumIcon w={{ base: '24px', lg: '32px' }} h={{ base: '24px', lg: '32px' }} />,
    },
  ]

  return (
    <Center w="100%" bg="bg.card" mt="auto">
      <Flex
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={{ base: 10, lg: 0 }}
        maxW="content"
        justifyContent="space-between"
        w="100%"
        px={{ base: '20px', lg: '30px' }}
        py={{ base: '30px', lg: '40px' }}
      >
        <Grid
          gridTemplateColumns={{ base: '32px 1fr auto', lg: '56px 1fr' }}
          gridTemplateRows={{ base: '32px', lg: '56px 48px' }}
          gridColumnGap={{ base: '8px', lg: '12px' }}
          gridRowGap="24px"
        >
          <Link href="/">
            <LogoSVG w={{ base: '32px', lg: '56px' }} h={{ base: '32px', lg: '56px' }} />
          </Link>
          <Text
            fontWeight="semibold"
            fontSize={{ base: '16px', lg: '24px' }}
            lineHeight={{ base: '32px', lg: '56px' }}
          >{t(i18n)`RGB++ Explorer`}</Text>
          <HStack gridColumn={{ base: 'auto', lg: '2/3' }} gap={{ base: '10px', lg: '28px' }}>
            {socialMedias.map(({ href, icon }) => (
              <Link
                key={href}
                rounded="100%"
                border="1px solid"
                borderColor="border.light"
                w={{ base: '32px', lg: '48px' }}
                h={{ base: '32px', lg: '48px' }}
                display="flex"
                justifyContent="center"
                alignItems="center"
                href={href}
                target="_blank"
                transition="200ms"
                _hover={{
                  color: 'brand',
                  borderColor: 'brand',
                }}
              >
                {icon}
              </Link>
            ))}
          </HStack>
        </Grid>
        <HStack
          gap={{ base: 'auto', lg: '134px' }}
          whiteSpace="nowrap"
          alignItems="start"
          justifyContent={{ base: 'space-between', lg: 'start' }}
          fontSize={{ base: '14px', lg: '16px' }}
        >
          <VStack w={{ base: 'auto', lg: '100%' }} gap="30px" alignItems="start">
            <Heading fontSize={{ base: '16px', lg: '18px' }}>{t(i18n)`Explorer`}</Heading>
            <VStack w="100%" gap="16px" color="text.third" alignItems="start">
              <Link href={env.public.MEMPOOL_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Bitcoin`}
              </Link>
              <Link href={env.public.CKB_EXPLORER_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`CKB`}
              </Link>
            </VStack>
          </VStack>
          <VStack w={{ base: 'auto', lg: '100%' }} gap="30px" alignItems="start">
            <Heading fontSize={{ base: '16px', lg: '18px' }}>{t(i18n)`RGB++`}</Heading>
            <VStack w="100%" gap="16px" color="text.third" alignItems="start">
              <Link href={env.public.RGBPP_WHITE_PAPER_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Whitepaper`}
              </Link>
              <Link href={env.public.RGBPP_SCRIPT_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Script`}
              </Link>
              <Link href={env.public.RGBPP_SDK_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`SDK`}
              </Link>
            </VStack>
          </VStack>
          <VStack w={{ base: 'auto', lg: '100%' }} gap="30px" alignItems="start">
            <Heading fontSize={{ base: '16px', lg: '18px' }}>{t(i18n)`More Info`}</Heading>
            <VStack w="100%" gap="16px" color="text.third" alignItems="start">
              <Link href={env.public.CKB_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`Nervos CKB`}
              </Link>
              <Link href={env.public.UTXO_STACK_URL} _hover={{ textDecoration: 'underline' }}>
                {t(i18n)`UTXO Stack`}
              </Link>
            </VStack>
          </VStack>
        </HStack>
      </Flex>
    </Center>
  )
}
