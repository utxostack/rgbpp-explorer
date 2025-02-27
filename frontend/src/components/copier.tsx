'use client'

import { Trans } from '@lingui/macro'
import { useMutation } from '@tanstack/react-query'
import { Box, type BoxProps, HStack } from 'styled-system/jsx'
import { useCopyToClipboard } from 'usehooks-ts'

import CopyIcon from '@/assets/copy.svg'
import { HoverCard, Text } from '@/components/ui'
import { delay } from '@/lib/delay'

export interface CopierProps extends BoxProps {
  value?: string
  onlyIcon?: boolean
}

export function Copier({ value = '', children, onlyIcon = false, ...props }: CopierProps) {
  const [, copyFn] = useCopyToClipboard()
  const {
    mutateAsync: onCopy,
    isPending,
    reset,
  } = useMutation({
    async mutationFn() {
      await copyFn(value)
      await delay(3000)
    },
  })

  if (onlyIcon) {
    return (
      <HStack gap="12px" fontSize="14px" lineHeight="16px" color="text.third" onClick={() => onCopy()} {...props}>
        <Text>{children ?? value}</Text>
        <HoverCard.Root
          openDelay={0}
          closeDelay={0}
          positioning={{ placement: 'top' }}
          onOpenChange={async (details) => {
            if (!details.open) {
              await delay(300)
              reset()
            }
          }}
        >
          <HoverCard.Trigger>
            <CopyIcon cursor="pointer" w="16px" h="16px" />
          </HoverCard.Trigger>
          <HoverCard.Positioner>
            <HoverCard.Content py="8px" color="text.primary">
              <HoverCard.Arrow>
                <HoverCard.ArrowTip />
              </HoverCard.Arrow>
              {isPending ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
            </HoverCard.Content>
          </HoverCard.Positioner>
        </HoverCard.Root>
      </HStack>
    )
  }

  return (
    <HoverCard.Root
      openDelay={0}
      closeDelay={0}
      positioning={{ placement: 'top' }}
      onOpenChange={async (details) => {
        if (!details.open) {
          await delay(300)
          reset()
        }
      }}
    >
      <HoverCard.Trigger>
        <HStack
          gap="12px"
          fontSize="14px"
          lineHeight="16px"
          color="text.third"
          onClick={() => onCopy()}
          cursor="pointer"
          {...props}
        >
          <Box>{children ?? value}</Box>
          <CopyIcon w="16px" h="16px" flexShrink={0} />
        </HStack>
      </HoverCard.Trigger>
      <HoverCard.Positioner>
        <HoverCard.Content py="8px" color="text.primary" pointerEvents="none">
          <HoverCard.Arrow>
            <HoverCard.ArrowTip />
          </HoverCard.Arrow>
          {isPending ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  )
}
