import { t } from '@lingui/macro'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import ComingSoonSVG from '@/assets/coming-soon.svg'
import { Text } from '@/components/ui'

import { VStack } from '../../../../../../../styled-system/jsx'

export default function Page() {
  const i18n = getI18nFromHeaders()
  return (
    <VStack gap="10px" w="100%" bg="bg.card" maxW="content" p="30px" rounded="8px" pt="74px" pb="260px">
      <ComingSoonSVG w="200px" h="200px" />
      <Text color="text.third" fontSize="14px">{t(i18n)`Coming soon, please stay tuned`}</Text>
    </VStack>
  )
}
