import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  /** Título da página, o `h1` da seção. */
  title: string
  /** Uma ou duas frases sobre quando usar o que a seção mostra. */
  description: string
  children: ReactNode
}

/** Corpo de uma página da galeria: título, descrição e o conteúdo da seção. */
export function Section({ title, description, children }: Props): ReactNode {
  return (
    <S.Root>
      <S.Header>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.Header>
      <S.Body>{children}</S.Body>
    </S.Root>
  )
}
