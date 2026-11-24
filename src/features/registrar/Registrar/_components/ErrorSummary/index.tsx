// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode, Ref } from 'react'

import { Notice } from '@design-system'

/** Um campo com erro no resumo. */
export type ErrorSummaryItem = {
  /** `id` do campo, para o link levar até ele. */
  fieldId: string
  /** A mensagem do campo, que já diz o que fazer. */
  message: string
}

type ErrorSummaryProps = {
  /** Campos com erro, na ordem da tela. */
  items: ErrorSummaryItem[]
  /** Recebe o foco no envio, para o leitor de tela ler o resumo primeiro. */
  ref: Ref<HTMLDivElement>
}

/**
 * Mostra o resumo de erros no topo do registro: "Falta corrigir N coisas" e um link por campo.
 *
 * @remarks
 * Segue o padrão do `Notice` em bloco `danger`. A tela manda o foco até ele quando o envio esbarra
 * em erro. Aparece mesmo com um erro só.
 */
export function ErrorSummary({ items, ref }: ErrorSummaryProps): ReactNode {
  const title =
    items.length === 1 ? 'Falta corrigir 1 coisa' : `Falta corrigir ${items.length} coisas`

  return (
    <Notice format="block" tone="danger" title={title} tabIndex={-1} ref={ref}>
      <ul>
        {items.map((item) => (
          <li key={item.fieldId}>
            <a href={`#${item.fieldId}`}>{item.message}</a>
          </li>
        ))}
      </ul>
    </Notice>
  )
}
