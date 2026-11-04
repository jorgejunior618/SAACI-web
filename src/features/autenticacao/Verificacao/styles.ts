import { styled } from '@/styled-system/jsx'

export const Email = styled('strong', {
  base: {
    display: 'block',
    marginTop: '1',
    color: 'ink',
    fontWeight: '500',
    wordBreak: 'break-all',
  },
})

export const Actions = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4' },
})

export const Form = styled('form', {
  base: { display: 'flex', flexDirection: 'column', gap: '3', width: '100%' },
})

export const FormButtons = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2' },
})

export const Footer = styled('div', {
  base: { marginTop: 'auto', paddingTop: '6' },
})

// Esta tela não tem barra de topo e começa com um aviso de largura total: ele desce para não ficar
// embaixo do botão do modo escuro.
export const Top = styled('div', {
  base: { paddingTop: 'calc(token(sizes.touch) - token(spacing.1))' },
})
