'use client'

import type { Assign, Tooltip as ArkTooltip } from '@ark-ui/react'
import { cloneElement, ReactElement, ReactNode } from 'react'
import type { HTMLStyledProps } from 'styled-system/types'

import { Tooltip } from '@/components/ui'
import { useDetectOverflow } from '@/hooks/useDetectOverflow'

export interface TextOverflowTooltipProps {
  children: ReactElement
  label: ReactNode
  contentProps?: Assign<HTMLStyledProps<'div'>, ArkTooltip.ContentBaseProps>
}

export function TextOverflowTooltip({ children, label, contentProps }: TextOverflowTooltipProps) {
  const [isOverflow, ref] = useDetectOverflow()

  return (
    <Tooltip.Root openDelay={0} closeDelay={0} disabled={!isOverflow}>
      <Tooltip.Trigger>{cloneElement(children, { ...children.props, ref })}</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
        <Tooltip.Content {...contentProps}>{label}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}
