import type { ReactNode } from 'react'

import * as S from './styles'

type Props = {
  title: string
  lead?: ReactNode
  eyebrow?: string
}

// Título de tela sem barra de topo (Acesso, Seu curso): 24px, com o texto de apoio logo abaixo.
export function PageHeader({ title, lead, eyebrow }: Props): ReactNode {
  return (
    <S.Header>
      {eyebrow && <S.Eyebrow>{eyebrow}</S.Eyebrow>}
      <S.Title>{title}</S.Title>
      {lead && <S.Lead>{lead}</S.Lead>}
    </S.Header>
  )
}
