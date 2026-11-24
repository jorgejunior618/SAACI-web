// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { VisuallyHidden } from '@/styled-system/jsx'

import { spinner } from './recipe'
import * as S from './styles'

/** Tamanho do indicador: `sm` dentro de botão ou linha, `lg` para tela inteira. */
export type SpinnerSize = 'sm' | 'lg'

export type SpinnerProps = {
  /** `sm` herda a cor do texto ao redor; `lg` usa o cinza do redemoinho com a ponta em `brand`. Padrão: `sm`. */
  size?: SpinnerSize
  /** Texto lido por leitor de tela, no gerúndio ("Enviando"). Não aparece na tela. Padrão: "Carregando". */
  label?: string
}

/**
 * Indica que algo está carregando, com `role="status"` e um texto para leitor de tela.
 *
 * @remarks
 * Com `prefers-reduced-motion` o giro fica mais lento (regra global do `panda.config.ts`).
 */
export function Spinner({ size = 'sm', label = 'Carregando' }: SpinnerProps): ReactNode {
  return (
    <S.Root role="status">
      <span className={spinner({ size })} aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </S.Root>
  )
}
