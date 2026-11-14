import { styled } from '@/styled-system/jsx'

// Ocupa o que sobra da altura depois da TopBar, para o Sair e o Excluir conta ficarem na base.
export const Page = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    minHeight: 'calc(100dvh - token(sizes.topbar) - env(safe-area-inset-top))',
    paddingInline: '6',
    paddingBlockStart: '6',
    paddingBlockEnd: '2',
  },
})
