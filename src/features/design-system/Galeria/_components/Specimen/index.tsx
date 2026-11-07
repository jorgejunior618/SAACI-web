import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  /** Nome da variante ou do estado mostrado, escrito como no código (`size="sm"`, `busy`). */
  label: string
  /** O componente naquela variante ou estado. */
  children: ReactNode
}

/** Quadro de uma variante ou estado, com o componente em cima e o nome embaixo. */
export function Specimen({ label, children }: Props): ReactNode {
  return (
    <S.Root>
      <S.Stage>{children}</S.Stage>
      <S.Caption>{label}</S.Caption>
    </S.Root>
  )
}
