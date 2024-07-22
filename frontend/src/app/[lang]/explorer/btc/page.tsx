import { t } from '@lingui/macro'
import { Box, Grid } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import { Info } from '@/app/[lang]/explorer/btc/info'
import { Heading } from '@/components/ui'

export default function Page() {
  const i18n = getI18nFromHeaders()
  return (
    <Grid gridTemplateColumns="repeat(2, 1fr)" w="100%" maxW="content" p="30px" gap="30px">
      <Info />
      <Box h="100px" bg="bg.card" rounded="8px" p="30px">
        <Heading fontSize="20px" fontWeight="semibold">{t(i18n)`Latest L2 RGB++ transaction`}</Heading>
      </Box>
      <Box h="100px" bg="bg.card" rounded="8px" p="30px">
        <Heading fontSize="20px" fontWeight="semibold">{t(i18n)`🔥 Popular RGB++ Assets`}</Heading>
      </Box>
    </Grid>
  )
}
