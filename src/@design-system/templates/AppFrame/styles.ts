import { styled } from '@/styled-system/jsx'

// Coluna mobile-first. Em tela larga, o conteúdo fica centralizado em 480px.
export const Frame = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 'content',
    minHeight: '100dvh',
    marginX: 'auto',
    background: 'surface.sunken',
  },
  variants: {
    hasNav: {
      // O rodapé de ação fica logo acima da barra inferior.
      true: { '--footer-bottom': 'calc(token(sizes.bottomnav) + env(safe-area-inset-bottom))' },
    },
  },
})
