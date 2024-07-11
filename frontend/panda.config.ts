import { defineConfig, defineGlobalStyles } from '@pandacss/dev'

const globalCss = defineGlobalStyles({
  body: {
    color: 'textPrimary',
    background: 'bgPrimary',
  },
})

export default defineConfig({
  jsxFramework: 'react',
  preflight: true,
  presets: ['@pandacss/preset-base', '@park-ui/panda-preset'],
  include: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            value: '#3483FF',
          },
          textPrimary: {
            value: '#fff',
          },
          textSecondary: {
            value: '#9A9CA6',
          },
          textLink: {
            value: '#319CFF',
          },
          danger: {
            value: '#FF4144',
          },
          warning: {
            value: '#FF8744',
          },
          success: {
            value: '#0FF082',
          },
          borderPrimary: {
            value: '#272A42',
          },
          bgPrimary: {
            value: '#11131F',
          },
        },
      },
    },
  },
  outdir: 'styled-system',
  globalCss,
})
