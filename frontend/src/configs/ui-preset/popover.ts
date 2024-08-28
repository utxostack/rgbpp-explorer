import { popoverAnatomy } from '@ark-ui/react'
import { defineSlotRecipe } from '@pandacss/dev'

export const popover = defineSlotRecipe({
  className: 'popover',
  slots: popoverAnatomy.keys(),
  base: {
    positioner: {
      position: 'relative',
    },
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
      display: 'flex',
      flexDirection: 'column',
      zIndex: 51,
      _open: {
        animation: 'fadeIn 0.25s ease-out',
      },
      _closed: {
        animation: 'fadeOut 0.2s ease-out',
      },
      _hidden: {
        display: 'none',
      },
    },
    title: {
      fontWeight: 'medium',
      textStyle: 'sm',
    },
    description: {
      color: 'fg.muted',
      textStyle: 'sm',
    },
    closeTrigger: {
      color: 'fg.muted',
    },
    arrow: {
      '--arrow-size': 'var(--sizes-3)',
      '--arrow-background': 'var(--colors-bg-card-hover)',
    },
    arrowTip: {
      borderColor: 'white.a2',
      borderTopWidth: '1px',
      borderLeftWidth: '1px',
    },
  },
})
