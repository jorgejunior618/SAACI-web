import type { ReactNode } from 'react'

import * as S from './styles'

const iniciais = (nome: string | null, email: string): string => {
  const partes = (nome ?? email.split('@')[0]).split(/[\s.]+/).filter(Boolean)
  const [primeira, ...resto] = partes
  return `${primeira?.[0] ?? ''}${resto.at(-1)?.[0] ?? ''}`.toUpperCase()
}

export function Cabecalho({ nome, email }: { nome: string | null; email: string }): ReactNode {
  return (
    <S.Wrapper>
      <S.Avatar aria-hidden>{iniciais(nome, email)}</S.Avatar>
      <S.Text>
        <S.Name>{nome ?? 'Seu nome ainda não está aqui'}</S.Name>
        <S.Email>{email}</S.Email>
      </S.Text>
    </S.Wrapper>
  )
}
