'use client'

import { cloneElement, ReactElement, ReactNode } from 'react'

import { Tooltip } from '@/components/ui'
import { useDetectOverflow } from '@/hooks/useDetectOverflow'

export interface TextOverflowTooltipProps {
  children: ReactElement
  label: ReactNode
}

export function TextOverflowTooltip({ children, label }: TextOverflowTooltipProps) {
  const [isOverflow, ref] = useDetectOverflow()

  return (
    <Tooltip.Root openDelay={0} closeDelay={0} disabled={!isOverflow}>
      <Tooltip.Trigger>{cloneElement(children, { ...children.props, ref })}</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Arrow>
          <Tooltip.ArrowTip />
        </Tooltip.Arrow>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}
