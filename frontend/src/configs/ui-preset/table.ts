import { defineSlotRecipe } from '@pandacss/dev'

export const table = defineSlotRecipe({
  className: 'table',
  slots: ['root', 'body', 'cell', 'footer', 'head', 'header', 'row', 'caption'],
  base: {
    root: {
      captionSide: 'bottom',
      width: 'full',
    },
    body: {
      '& tr:last-child': {
        borderBottomWidth: '0',
      },
    },
    caption: {
      color: 'fg.subtle',
    },
    cell: {
      verticalAlign: 'middle',
    },
    footer: {
      fontWeight: 'medium',
      borderTopWidth: '1px',
      '& tr:last-child': {
        borderBottomWidth: '0',
      },
    },
    header: {
      color: 'text.third',
      textAlign: 'left',
      verticalAlign: 'middle',
    },
    row: {
      transitionDuration: 'normal',
      transitionProperty: 'background, color',
      transitionTimingFunction: 'default',
      position: 'relative',
      borderBottom: '1px solid',
      borderBottomColor: 'border.primary',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'plain',
  },
  variants: {
    variant: {
      outline: {
        root: {
          borderWidth: '1px',
        },
        head: {
          bg: 'bg.subtle',
        },
      },
      plain: {
        row: {
          _hover: {
            bg: 'bg.card.hover',
          },
          _selected: {
            bg: 'bg.muted',
          },
        },
      },
    },
    size: {
      md: {
        root: {
          textStyle: 'sm',
        },
        caption: {
          mt: '4',
        },
        cell: {
          px: '4',
          py: '18px',
          _first: {
            pl: '30px',
          },
          _last: {
            pr: '30px',
          },
        },
        header: {
          height: '11',
          px: '4',
          _first: {
            pl: '30px',
          },
          _last: {
            pr: '30px',
          },
        },
      },
    },
  },
})
