import type { Assign } from '@ark-ui/react'
import { ark, type HTMLArkProps } from '@ark-ui/react/factory'
import { styled } from 'styled-system/jsx'
import { button, type ButtonVariantProps } from 'styled-system/recipes'
import type { JsxStyleProps } from 'styled-system/types'

export interface ButtonProps extends Assign<JsxStyleProps, HTMLArkProps<'button'>>, ButtonVariantProps {}
export const Button = styled(ark.button, button)
