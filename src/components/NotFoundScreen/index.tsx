// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { SearchX } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen } from '@design-system'

export type NotFoundScreenProps = {
  /** Fato em poucas palavras, por exemplo "Não encontramos esta atividade". */
  title: string
  /** O que pode ter acontecido e o próximo passo. */
  description: string
  /** Destino do botão de volta: a lista da entidade, o Início ou o Entrar. */
  backHref: string
  /** Texto do botão de volta, com verbo ("Voltar para Atividades"). */
  backLabel: string
}

/**
 * Mostra a tela de "não encontrado" com um botão que leva de volta a um lugar que existe.
 *
 * @remarks
 * A posição do `not-found.tsx` diz o que não foi achado: na raiz, URL sem rota; no grupo, rede de
 * segurança; na entidade, o item que não existe. Os três reusam este componente e mudam só o texto
 * e o destino. Só o `not-found.tsx` da raiz pode ter `metadata`.
 *
 * @example
 * ```tsx
 * <NotFoundScreen
 *   title="Não encontramos esta atividade"
 *   description="Ela pode ter sido removida. Volte para a lista e escolha outra."
 *   backHref="/atividades"
 *   backLabel="Voltar para Atividades"
 * />
 * ```
 */
export function NotFoundScreen({
  title,
  description,
  backHref,
  backLabel,
}: NotFoundScreenProps): ReactNode {
  return (
    <AppFrame>
      <StateScreen
        variant="empty"
        icon={SearchX}
        title={title}
        description={description}
        actions={
          <Button as={NextLink} href={backHref} block>
            {backLabel}
          </Button>
        }
      />
    </AppFrame>
  )
}
