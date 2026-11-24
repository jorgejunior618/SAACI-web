// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { ChevronRight, ExternalLink } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Icon } from '@design-system'

import { SOURCE_CODE_URL } from '@/constants/source-code'

import * as S from './styles'

/**
 * Cartão "Sobre o SAACI" do Perfil: o aviso de privacidade e o código-fonte.
 *
 * @remarks
 * O código-fonte abre o repositório em outra aba, com o ícone de link externo no lugar da seta,
 * porque sai do sistema. Ele cumpre a oferta do código a quem usa o SAACI pela rede (AGPL-3.0). O
 * Sair fica abaixo do separador, junto do Apagar minha conta (`SignOutButton`).
 *
 * @example
 * ```tsx
 * <AboutCard />
 * ```
 */
export function AboutCard(): ReactNode {
  return (
    <S.Root>
      <S.Title>Sobre o SAACI</S.Title>
      <S.List>
        <S.RowLink as={NextLink} href="/privacidade">
          <span>Aviso de privacidade</span>
          <S.Chevron>
            <Icon icon={ChevronRight} size="sm" />
          </S.Chevron>
        </S.RowLink>
        <S.RowLink href={SOURCE_CODE_URL} target="_blank" rel="noopener noreferrer">
          <span>Código-fonte</span>
          <S.Chevron>
            <Icon icon={ExternalLink} size="sm" />
          </S.Chevron>
        </S.RowLink>
      </S.List>
    </S.Root>
  )
}
