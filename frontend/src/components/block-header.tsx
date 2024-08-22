import { t } from '@lingui/macro'

import BlockIcon from '@/assets/block.svg'
import { Copier } from '@/components/copier'
import { Heading, Text } from '@/components/ui'
import { Icon } from '@/components/ui/primitives/icon'
import { getI18nFromHeaders } from '@/lib/get-i18n-from-headers'
import { formatNumber } from '@/lib/string/format-number'

import { Box, Grid } from '../../styled-system/jsx'

export function BlockHeader({
  id,
  height,
  confirmations,
}: {
  id: string
  height: number
  confirmations?: number | null
}) {
  const i18n = getI18nFromHeaders()

  return (
    <Grid
      gridTemplateColumns={{ base: 'auto 1fr', lg: '56px auto 1fr' }}
      w="100%"
      columnGap="16px"
      rowGap="4px"
      bg="bg.card"
      rounded="8px"
      p={{ base: '20px', xl: '30px' }}
      justifyContent="start"
      alignItems="center"
    >
      <Icon display={{ base: 'none', lg: 'block' }} w="56px" h="56px" gridRow="1/3">
        <BlockIcon />
      </Icon>

      <Heading fontSize="20px" fontWeight="semibold" gridRow="1/2">
        {t(i18n)`Block ${formatNumber(height)}`}
      </Heading>

      <Box gridRow="2/3" gridColumn={{ base: '1/3', lg: '2/3' }}>
        <Copier value={id} wordBreak="break-all" textAlign="left">
          {id}
        </Copier>
      </Box>

      {confirmations ? (
        <Box
          color="brand"
          fontWeight="semibold"
          fontSize={{ base: '16px', md: '20px' }}
          mt={{ base: 0, md: 'auto' }}
          mb={{ base: 'auto', md: 'auto' }}
          lineHeight={{ base: '22px', md: '24px' }}
          py={{ base: 0, md: '4px' }}
          px="12px"
          rounded="4px"
          bg="brand.a10"
          border="1px solid currentColor"
          w="fit-content"
          ml="auto"
          gridRow="1/3"
          gridColumn={{ base: '2/3', lg: '3/4' }}
        >
          {formatNumber(confirmations)}{' '}
          <Text as="span" fontSize="14px" fontWeight="medium" display={{ base: 'none', xl: 'inline' }}>
            {t(i18n)`Confirmations`}
          </Text>
        </Box>
      ) : null}
    </Grid>
  )
}
