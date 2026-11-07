import { defineConfig } from '@pandacss/dev'

import { keyframes, semanticTokens, textStyles, tokens } from './src/@design-system/tokens'

export default defineConfig({
  preflight: true,
  jsxFramework: 'react',
  outdir: 'src/styled-system',
  include: ['./src/**/*.{ts,tsx}'],
  exclude: ['./src/styled-system/**'],
  // Só a preset-base: a escala padrão do Panda não existe, todo valor vem dos tokens do SAACI.
  presets: ['@pandacss/preset-base'],
  // O tema segue o do sistema, sem JavaScript: os tokens com `_dark` valem nesta media query.
  conditions: {
    extend: {
      // dark: '@media (prefers-color-scheme: dark)',
      dark: '@media (prefers-color-scheme: dark) and (max-width: 0px)',
    },
  },
  globalCss: {
    html: {
      // Barra de rolagem e controles nativos seguem o tema.
      colorScheme: 'light dark',
    },
    'html, body': {
      background: 'surface.sunken',
      color: 'ink',
      fontFamily: 'sans',
      textStyle: 'body',
      WebkitFontSmoothing: 'antialiased',
    },
    ':where(a, button, input, select, textarea, summary, [tabindex]):focus-visible': {
      outline: '2px solid',
      outlineColor: 'focus',
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '2.4s !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0ms !important',
      },
    },
  },
  theme: {
    extend: {
      tokens,
      semanticTokens,
      textStyles,
      keyframes,
    },
  },
})
