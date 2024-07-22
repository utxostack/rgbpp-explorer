import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { Box, HStack, VStack } from 'styled-system/jsx'

import { Overflow } from '@/app/[lang]/transaction/[tx]/overflow'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'

export default function Page({ params: { tx } }: { params: { tx: string } }) {
  return (
    <VStack w="100%" maxW="content" p="30px" gap="30px">
      <HStack w="100%" gap="24px" p="30px" bg="bg.card" rounded="8px">
        <Heading fontSize="20px" fontWeight="semibold">
          {t(i18n)`Transactions`}
        </Heading>
        <Copier value={tx}>{tx}</Copier>
        <Box
          color="brand"
          fontWeight="semibold"
          fontSize="20px"
          lineHeight="24px"
          py="4px"
          px="12px"
          rounded="4px"
          bg="brand.a10"
          border="1px solid currentColor"
          ml="auto"
        >
          6930{' '}
          <Text as="span" fontSize="14px" fontWeight="medium">
            confirmations
          </Text>
        </Box>
      </HStack>
      <Overflow />
    </VStack>
  )
}
