import { defineRecipe, type RecipeConfig } from '@pandacss/dev'

import { button } from '@/configs/ui-preset/button'
import { deepmerge } from '@/lib/deepmerge'

export const iconButton: RecipeConfig = deepmerge(
  button,
  defineRecipe({
    className: 'iconButton',
    variants: {
      size: {
        xs: {
          px: '0',
        },
        sm: {
          px: '0',
        },
        md: {
          px: '0',
        },
        lg: {
          px: '0',
        },
        xl: {
          px: '0',
        },
        '2xl': {
          px: '0',
        },
      },
    },
  }),
)
