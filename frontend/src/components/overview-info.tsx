import { ReactNode } from 'react'
import { Box, BoxProps, Flex, FlexProps, Grid, GridProps, HStack, Stack, StackProps } from 'styled-system/jsx'

import { ComingSoonText } from '@/components/coming-soon-text'
import { Text } from '@/components/ui'
import { Icon } from '@/components/ui/primitives/icon'
import { formatNumber as formatNumberFn } from '@/lib/string/format-number'

export const splitLineBefore = {
  content: { base: 'none', md: '" "' },
  pos: 'absolute',
  top: '50%',
  right: '0',
  w: '1px',
  h: '40px',
  bg: 'border.primary',
  transform: 'translateY(-50%)',
}

export function OverviewInfo({ children, ...props }: FlexProps) {
  return (
    <Flex
      flexDirection={{ base: 'column', md: 'row' }}
      gap={{ base: '16px', md: 0 }}
      py={{ base: '20px', md: '25px' }}
      bg="bg.card.hover"
      rounded="8px"
      fontSize="20px"
      lineHeight="100%"
      alignItems="center"
      {...props}
    >
      {children}
    </Flex>
  )
}

export function OverviewInfoGrid({ children, ...props }: GridProps) {
  return (
    <Grid py="25px" bg="bg.card.hover" rounded="8px" fontSize="20px" lineHeight="100%" alignItems="center" {...props}>
      {children}
    </Grid>
  )
}

export function OverviewInfoItem({
  label,
  children,
  unsupported,
  formatNumber,
  unit,
  valueProps,
  ...props
}: StackProps & {
  label: ReactNode
  unsupported?: boolean
  formatNumber?: boolean
  unit?: ReactNode
  valueProps?: BoxProps
}) {
  return (
    <Stack
      px="20px"
      w="100%"
      justify="space-between"
      alignItems="center"
      direction={{ base: 'row', md: 'column' }}
      gap="15px"
      flex={1}
      textAlign="center"
      fontSize={{ base: '14px', md: '20px' }}
      pos="relative"
      _before={splitLineBefore}
      _last={{
        _before: {
          content: 'none',
        },
      }}
      {...props}
    >
      {typeof label === 'string' || typeof label === 'number' ? (
        <Text color="text.third" fontSize="14px" lineHeight="24px" whiteSpace="nowrap">
          {label}
        </Text>
      ) : (
        label
      )}
      <Box flex={1} textAlign={{ base: 'right', md: 'center' }} {...valueProps}>
        {unsupported ? (
          <Text as="span" color="text.third">
            <ComingSoonText />
          </Text>
        ) : (
          <>
            {formatNumber && (typeof children === 'number' || typeof children === 'string')
              ? formatNumberFn(children)
              : children ?? '-'}
            {unit ? (
              <Text as="span" color="text.third" fontSize="12px" ml="4px">
                {unit}
              </Text>
            ) : null}
          </>
        )}
      </Box>
    </Stack>
  )
}

export function OverviewInfoTagLabel({ icon, children, ...props }: BoxProps & { icon?: ReactNode }) {
  return (
    <HStack
      bg="black.a10"
      color="text.primary"
      px="10px"
      rounded="4px"
      gap="4px"
      lineHeight="24px"
      w="fit-content"
      {...props}
    >
      <Icon w="20px" h="20px">
        {icon}
      </Icon>
      <Text fontSize="14px" fontWeight="semibold">
        {children}
      </Text>
    </HStack>
  )
}
