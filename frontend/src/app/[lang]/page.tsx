import { t } from '@lingui/macro'
import { Box, Center, Flex } from 'styled-system/jsx'

import HomeBgSVG from '@/assets/home-bg.svg'
import { HomeQuickInfo } from '@/components/home-quick-info'
import { HomeTitle } from '@/components/home-title'
import { LastRgbppTxnsTable } from '@/components/last-rgbpp-txns-table'
import { NetworkCards } from '@/components/network-cards'
import { SearchBar } from '@/components/search-bar'
import { Heading } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default function Home() {
  const i18n = getI18nFromHeaders()
  return (
    <>
      <Center w="100%" position="relative" mb="-25%" px="30px">
        <HomeBgSVG w="100%" pos="absolute" top="50px" left="0" />
        <Flex w="100%" direction="column" pos="relative" aspectRatio={1440 / 1063}>
          <Flex w="100%" direction="column" textAlign="center" align="center" justify="start">
            <HomeTitle />
            <HomeQuickInfo />
            <SearchBar mt="60px" />
          </Flex>
        </Flex>
      </Center>
      <Center w="100%" position="relative" mb="54px" px="30px">
        <Flex maxW="content" direction="column" alignItems="center" justify="start" w="100%">
          <Heading fontSize="40px" fontWeight="semibold" mb="60px">{t(i18n)`RGB++ Networks`}</Heading>
          <NetworkCards />
          <Heading fontSize="40px" fontWeight="semibold" mb="60px" mt="100px">{t(i18n)`Latest RGB++ Txns`}</Heading>
          <Box w="100%" bg="bg.card" pt="30px" pb="20px" rounded="8px">
            <LastRgbppTxnsTable />
          </Box>
        </Flex>
      </Center>
    </>
  )
}
