import { t } from '@lingui/macro'
import { LastRgbppTxnsTable } from 'src/components/latest-tx-list'
import { Box, Center, Flex } from 'styled-system/jsx'

import HomeBgSVG from '@/assets/home-bg.svg'
import { HomeQuickInfo } from '@/components/home-quick-info'
import { HomeTitle } from '@/components/home-title'
import { NetworkCards } from '@/components/network-cards'
import { SearchBar } from '@/components/search-bar'
import { Heading } from '@/components/ui'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'

export default function Home() {
  const i18n = getI18nFromHeaders()
  return (
    <>
      <Center flexDir="column" w="100%" position="relative" px={{ base: '20px', xl: '30px' }}>
        <HomeBgSVG w="100%" pos="absolute" top="50px" left="0" />
        <Flex
          w="100%"
          direction="column"
          pos="relative"
          aspectRatio={{ base: 1440 / 1100, lg: 1440 / 900, xl: 1440 / 800, '2xl': 1440 / 680 }}
        >
          <Flex w="100%" direction="column" textAlign="center" align="center" justify="start" gap="54px" pb="40px">
            <HomeTitle />
            <HomeQuickInfo />
            <SearchBar />
          </Flex>
        </Flex>
      </Center>
      <Center w="100%" position="relative" mb="54px" px={{ base: '20px', xl: '30px' }}>
        <Flex maxW="content" direction="column" alignItems="center" justify="start" w="100%">
          <Heading
            fontSize={{ base: '22px', sm: '32px', xl: '40px' }}
            mb={{ base: '50px', xl: '60px' }}
            fontWeight="semibold"
          >{t(i18n)`RGB++ Networks`}</Heading>
          <NetworkCards />
          <Heading
            fontSize={{ base: '22px', sm: '32px', xl: '40px' }}
            fontWeight="semibold"
            mb={{ base: '50px', xl: '60px' }}
            mt={{ base: '80px', xl: '100px' }}
          >{t(i18n)`Latest RGB++ Txns`}</Heading>
          <Box w="100%" bg="bg.card" pt={{ base: '10px', md: '30px' }} pb={{ base: '10px', md: '20px' }} rounded="8px">
            <LastRgbppTxnsTable />
          </Box>
        </Flex>
      </Center>
    </>
  )
}
