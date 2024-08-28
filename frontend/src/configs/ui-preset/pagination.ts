import { paginationAnatomy } from '@ark-ui/react'
import { defineSlotRecipe } from '@pandacss/dev'

export const pagination = defineSlotRecipe({
  className: 'pagination',
  slots: paginationAnatomy.keys(),
  base: {
    root: {
      display: 'flex',
      gap: '8px',
    },
    item: {
      fontVariantNumeric: 'tabular-nums',
    },
    ellipsis: {
      alignItems: 'center',
      color: 'text.third',
      display: 'inline-flex',
      fontWeight: 'semibold',
      px: '2',
    },
  },
})
