import { cva } from '@/styled-system/css'

export const topBar = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    // 56px mais a área segura de cima; a altura é mínima porque o texto pode crescer com o zoom.
    minHeight: 'calc(token(sizes.topbar) + env(safe-area-inset-top))',
    paddingTop: 'env(safe-area-inset-top)',
    paddingInlineEnd: '1',
    background: 'surface.sunken',
    // Linha de 1px que fica invisível parado e aparece quando o conteúdo rola por baixo da barra.
    // Sem `animation-timeline` no navegador, a linha não aparece, que é o estado parado.
    _after: {
      content: '""',
      position: 'absolute',
      insetInline: '0',
      bottom: '0',
      height: '1px',
      background: 'line',
      opacity: '0',
      pointerEvents: 'none',
    },
    '@supports (animation-timeline: scroll())': {
      _after: {
        animationName: 'edgeIn',
        animationTimingFunction: 'linear',
        animationFillMode: 'both',
        // `scroll()` segue o rolador mais próximo: a página numa tela real, a janela num exemplo.
        animationTimeline: 'scroll()',
        // 16px é a distância de rolagem até a linha ficar inteira.
        animationRange: '0 16px',
      },
    },
    // A regra global de movimento reduzido fixa a duração; numa animação de rolagem ela
    // desligaria o vínculo com a barra. A linha só muda de opacidade, então pode seguir a rolagem.
    '@media (prefers-reduced-motion: reduce)': {
      _after: { animationDuration: 'auto !important' },
    },
  },
  variants: {
    variant: {
      home: { paddingInlineStart: '4' },
      // Aba da barra inferior: sem Voltar, o título começa na margem de 16px como a marca.
      root: { paddingInlineStart: '4' },
      // O botão Voltar já tem 48px de alvo e encosta na borda da tela.
      inner: { paddingInlineStart: '0' },
    },
  },
  defaultVariants: { variant: 'home' },
})

// O título da aba (`root`) é maior que o da tela interna, que divide a linha com o Voltar.
export const topBarTitle = cva({
  base: {
    flex: '1',
    minWidth: '0',
    margin: '0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  variants: {
    level: {
      root: { textStyle: 'title' },
      inner: { textStyle: 'bodyStrong' },
    },
  },
  defaultVariants: { level: 'inner' },
})
