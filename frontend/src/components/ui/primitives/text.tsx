import { styled } from 'styled-system/jsx'
import { text, type TextVariantProps } from 'styled-system/recipes'
import type { ComponentProps, StyledComponent } from 'styled-system/types'

type ParagraphProps = TextVariantProps & { as?: React.ElementType }

export type TextProps = ComponentProps<typeof Text>
export const Text = styled('p', text) as StyledComponent<'p', ParagraphProps>
