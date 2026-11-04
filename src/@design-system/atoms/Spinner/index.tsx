import type { ReactNode } from 'react'

import { spinner } from './styles'

type Props = {
  size?: 'sm' | 'lg'
}

// Decorativo: quem usa o spinner escreve o que está acontecendo ao lado.
export function Spinner({ size = 'sm' }: Props): ReactNode {
  return <span className={spinner({ size })} aria-hidden />
}
