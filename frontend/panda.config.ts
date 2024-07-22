import { defineConfig, defineGlobalStyles } from '@pandacss/dev'
import { createPreset } from '@park-ui/panda-preset'

import { button } from '@/configs/ui-preset/button'
import { hoverCard } from '@/configs/ui-preset/hover-card'
import { iconButton } from '@/configs/ui-preset/icon-button'
import { pagination } from '@/configs/ui-preset/pagination'
import { table } from '@/configs/ui-preset/table'
import { tabs } from '@/configs/ui-preset/tabs'
import { tooltip } from '@/configs/ui-preset/tooltip'

const globalCss = defineGlobalStyles({
  body: {
    color: 'text.primary',
    background: 'bg.default',
    '--colors-bg-default': 'var(--colors-bg-primary)',
    minW: '1280px',
    fontFamily: 'var(--font-montserrat)',
    fontWeight: 'medium',
    minH: '100svh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})

export default defineConfig({
  jsxFramework: 'react',
  preflight: true,
  presets: [
    '@pandacss/preset-base',
    createPreset({
      accentColor: 'blue',
      grayColor: 'slate',
      borderRadius: 'sm',
    }),
  ],
  include: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  theme: {
    extend: {
      recipes: {
        button,
        iconButton,
      },
      slotRecipes: {
        table,
        tooltip,
        pagination,
        tabs,
        hoverCard,
      },
      tokens: {
        sizes: {
          content: {
            value: '1280px',
          },
        },
        colors: {
          brand: {
            value: '#3483FF',
            a10: {
              value: 'rgba(52,131,255,0.1)',
            },
          },
          danger: {
            value: '#FF4144',
            a10: {
              value: 'rgba(255,65,68,0.1)',
            },
          },
          warning: {
            value: '#FF8744',
            a10: {
              value: 'rgba(255,135,68,0.1)',
            },
          },
          success: {
            value: '#0FF082',
            a10: {
              value: 'rgba(15,240,130,0.1)',
            },
          },
          border: {
            primary: {
              value: '#272A42',
            },
            light: {
              value: '#4C546D',
            },
          },
          text: {
            primary: {
              value: '#fff',
            },
            secondary: {
              value: '#cecece',
            },
            third: {
              value: '#9A9CA6',
            },
            disabled: {
              value: 'rgba(255, 255, 255, 0.6)',
            },
            link: {
              value: '#319CFF',
            },
          },
          bg: {
            primary: {
              value: '#11131F',
            },
            card: {
              value: '#1D1F31',
              hover: {
                value: '#181A29',
              },
            },
            input: {
              value: '#292C44',
            },
          },
        },
      },
    },
  },
  outdir: 'styled-system',
  globalCss,
})
