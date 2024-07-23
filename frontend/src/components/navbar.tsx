import { t } from '@lingui/macro'
import { Center, Flex, HStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import LogoSVG from '@/assets/logo.svg'
import { Text } from '@/components/ui'
import { Link } from '@/components/ui/link'

export function Navbar() {
  const i18n = getI18nFromHeaders()
  return (
    <Center bg="bg.card" w="100%" px="30px" pos="sticky" top="0" zIndex="50">
      <Flex maxW="1280px" w="100%" py="20px">
        <Link display="flex" href="/" gap="8px" alignItems="center">
          <LogoSVG w="40px" h="40px" />
          <Text fontWeight="semibold" size="xl">{t(i18n)`RGB++ Explorer`}</Text>
        </Link>
        <HStack ml="72px" gap="48px" fontWeight="medium">
          <Link href="/explorer" _hover={{ textDecoration: 'underline' }}>{t(i18n)`Explorer`}</Link>
          <Link href="/assets" _hover={{ textDecoration: 'underline' }}>{t(i18n)`RGB++ Assets`}</Link>
        </HStack>
      </Flex>
    </Center>
  )
}
