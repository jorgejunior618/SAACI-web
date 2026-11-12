import { styled } from '@/styled-system/jsx'
import { token } from '@/styled-system/tokens'

export const Root = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1',
    marginBlockStart: 'auto',
  },
})

export const Row = styled('div', {
  base: { display: 'flex', justifyContent: 'center', gap: '6' },
})

// Excluir conta é a saída mais séria, então fica em cinza e não em verde. O estilo em linha vence a
// cor do `Link`, que vem de uma classe do design system.
// TODO: contorno. Pedir à equipe uma variante cinza no `Link` do DS e remover este estilo.
export const quietLink = { color: token.var('colors.ink.muted') }
