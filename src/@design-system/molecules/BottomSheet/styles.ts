import { styled } from '@/styled-system/jsx'

// O `dialog` não tem caixa própria: ele só ancora o painel na base e leva o véu em `::backdrop`.
// Assim, um clique que cai no próprio `dialog` é sempre um clique no véu.
export const Dialog = styled('dialog', {
  base: {
    // O navegador centraliza o `dialog` e limita a largura; aqui ele desce para a base.
    margin: '0',
    marginBlockStart: 'auto',
    marginInline: 'auto',
    padding: '0',
    border: 'none',
    background: 'transparent',
    color: 'ink',
    width: '100%',
    maxWidth: 'content',
    maxHeight: 'none',
    overflow: 'visible',
    _backdrop: { background: 'scrim' },
  },
})

export const Panel = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    // Sheet alto demais rola dentro do painel e não empurra a página.
    maxHeight: '90dvh',
    overflowY: 'auto',
    paddingBlockStart: '2',
    paddingBlockEnd: '6',
    paddingInline: '4',
    background: 'surface.raised',
    borderTopLeftRadius: 'card',
    borderTopRightRadius: 'card',
    // Única sombra do sistema: o sheet é o único que fica por cima de outro conteúdo.
    boxShadow: 'overlay',
    // Sobe da base. Com `prefers-reduced-motion` o painel só aparece.
    animationName: 'sheetIn',
    animationDuration: 'fast',
    animationTimingFunction: 'out',
    _motionReduce: { animationName: 'none' },
  },
})

// Alça: 36 por 4px são medidas do desenho; `sizes` não tem escala numérica.
export const Grip = styled('span', {
  base: {
    alignSelf: 'center',
    width: '36px',
    height: '4px',
    marginBlockEnd: '4',
    borderRadius: 'control',
    background: 'line',
  },
})

export const Title = styled('h2', {
  base: {
    margin: '0',
    textStyle: 'title',
    // Recebe foco por código ao abrir, então o contorno de foco não ajuda quem vê.
    outline: 'none',
  },
})

export const Description = styled('p', {
  base: { margin: '0', marginBlockStart: '2', textStyle: 'support', color: 'ink.muted' },
})

export const Actions = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    marginBlockStart: '6',
  },
})
