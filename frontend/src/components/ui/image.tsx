'use client'

import NextImage from 'next/image'
import { styled } from 'styled-system/jsx'

const forwardPropSet = new Set(['width', 'height', 'blurDataURL', 'blurWidth', 'blurHeight'])

export const Image = styled(
  NextImage,
  {},
  {
    shouldForwardProp(prop: string): boolean {
      return forwardPropSet.has(prop)
    },
  },
)
