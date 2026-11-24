// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { getInitials } from '../../utils'
import * as S from './styles'

export type ProfileHeaderProps = {
  /** Nome do perfil. `null` enquanto não foi preenchido: a tela mostra só o e-mail. */
  name: string | null
  /** E-mail da conta. */
  email: string
}

/**
 * Cabeçalho do Perfil: círculo com as iniciais, o nome e o e-mail.
 *
 * @remarks
 * As iniciais são enfeite e ficam escondidas do leitor de tela, porque o nome vem logo ao lado.
 *
 * @example
 * ```tsx
 * <ProfileHeader name="Ana Beatriz Moura" email="ana.moura07@aluno.ifce.edu.br" />
 * ```
 */
export function ProfileHeader({ name, email }: ProfileHeaderProps): ReactNode {
  return (
    <S.Root>
      <S.Avatar aria-hidden="true">{getInitials(name, email)}</S.Avatar>
      <S.Text>
        {name ? <S.Name>{name}</S.Name> : null}
        <S.Email>{email}</S.Email>
      </S.Text>
    </S.Root>
  )
}
