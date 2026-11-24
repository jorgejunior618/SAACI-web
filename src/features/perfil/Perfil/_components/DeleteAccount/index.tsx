// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import * as S from './styles'

/**
 * Bloco "Apagar minha conta" do Perfil: o link para a tela de exclusão e o que ela apaga.
 *
 * @remarks
 * Só navega. Quem pede a senha e apaga é a tela Excluir conta. O texto em vermelho marca a ação
 * irreversível. A divisória acima, que separa o Sair e este bloco do resto, fica no `ProfileContent`.
 *
 * @example
 * ```tsx
 * <DeleteAccount />
 * ```
 */
export function DeleteAccount(): ReactNode {
  return (
    <S.Root>
      <S.Action as={NextLink} href="/excluir-conta">
        Apagar minha conta
      </S.Action>
      <S.Help>Apaga a conta, as atividades e os comprovantes. Não dá para desfazer.</S.Help>
    </S.Root>
  )
}
