import { hoverCardAnatomy } from '@ark-ui/react'
import { defineSlotRecipe } from '@pandacss/dev'

export const hoverCard = defineSlotRecipe({
  className: 'hoverCard',
  slots: hoverCardAnatomy.keys(),
  base: {
    content: {
      '--hover-card-background': 'var(--colors-bg-card-hover)',
      background: 'bg.card.hover',
      borderRadius: 'l3',
      border: '1px solid',
      borderColor: 'white.a2',
      boxShadow: 'lg',
      maxW: '80',
      p: '4',
      position: 'relative',
      zIndex: 51,
      _open: {
        animation: 'fadeIn 0.25s ease-out',
      },
      _closed: {
        animation: 'fadeOut 0.2s ease-out',
      },
    },
    arrow: {
      '--arrow-size': '12px',
      '--arrow-background': 'var(--colors-bg-card-hover)',
    },
    arrowTip: {
      borderColor: 'white.a2',
      borderTopWidth: '1px',
      borderLeftWidth: '1px',
    },
  },
})
