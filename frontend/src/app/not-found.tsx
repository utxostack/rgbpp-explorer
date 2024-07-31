import { t } from '@lingui/macro'
import { Center } from 'styled-system/jsx'

import NotFoundSVG from '@/assets/not-found.svg'
import { Button, Text } from '@/components/ui'
import Link from '@/components/ui/link'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default function NotFound() {
  const i18n = getI18nFromHeaders()

  return (
    <Center flexDir="column" flex={1} bg="bg.card" maxW="content" w="100%" my="30px" p="30px">
      <NotFoundSVG w="200px" h="200px" />
      <Text fontSize="14px" fontWeight="medium" color="text.third" mb="24px">{t(
        i18n,
      )`Sorry, the page you visited does not exist`}</Text>
      <Link href="/">
        <Button size="sm">{t(i18n)`Back to Home`}</Button>
      </Link>
    </Center>
  )
}
