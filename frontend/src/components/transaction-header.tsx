import type { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import BigNumber from 'bignumber.js'

import { Copier } from '@/components/copier'
import { IfBreakpoint } from '@/components/if-breakpoint'
import { LayerType, LayerTypeProps } from '@/components/layer-type'
import { Heading, Text } from '@/components/ui'
import { formatNumber } from '@/lib/string/format-number'

import { Box, Grid } from '../../styled-system/jsx'

export function TransactionHeader({
  type,
  txid,
  confirmations,
  i18n,
}: {
  type: LayerTypeProps['type']
  txid: string
  confirmations?: BigNumber.Value
  i18n: I18n
}) {
  const layerType = type ? <LayerType display="inline-flex" type={type} /> : null
  return (
    <Grid
      gridTemplateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, auto) 1fr' }}
      w="100%"
      gap={{ base: '16px', xl: '24px' }}
      bg="bg.card"
      rounded="8px"
      p={{ base: '20px', xl: '30px' }}
      justifyContent="start"
      alignItems="center"
    >
      <Heading
        flexDirection={{ base: 'column', sm: 'row' }}
        display="flex"
        alignItems={{ base: 'start', sm: 'center' }}
        gap={{ base: '16px', sm: '20px' }}
        fontSize="20px"
        lineHeight="24px"
        fontWeight="semibold"
      >
        {t(i18n)`Transactions`}
        <IfBreakpoint breakpoint="lg" fallback={layerType} />
      </Heading>
      <Box gridRow={{ base: '2/3', lg: 'auto' }} gridColumn={{ base: '1/3', lg: 'auto' }}>
        <Copier value={txid} textAlign="left">
          <Text wordBreak="break-all">{txid}</Text>
        </Copier>
      </Box>
      <IfBreakpoint breakpoint="lg">{layerType}</IfBreakpoint>
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
