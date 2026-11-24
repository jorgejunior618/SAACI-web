// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import * as S from './styles'

/** Tamanho do ícone: `sm` em linha de texto, `md` em botão, `lg` na barra inferior, `xl` dentro do círculo da tela de estado. */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl'

const PIXELS: Record<IconSize, number> = { sm: 16, md: 20, lg: 22, xl: 28 }

export type IconProps = {
  /** Ícone do `lucide-react`, importado por quem usa (`Camera`, `ArrowLeft`). */
  icon: LucideIcon
  /** Tamanho em pixels: 16 (`sm`), 20 (`md`), 22 (`lg`) ou 28 (`xl`). Padrão: `md`. */
  size?: IconSize
}

/**
 * Desenha um ícone do Lucide com o traço de 1,5px do design e a cor do texto ao redor.
 *
 * @remarks
 * Fica escondido de leitor de tela (`aria-hidden`), porque o ícone nunca aparece sozinho: o texto do
 * botão ou do link carrega o significado. Ícone sem texto precisa de `aria-label` no elemento pai.
 */
export function Icon({ icon: Glyph, size = 'md' }: IconProps): ReactNode {
  return (
    <Glyph
      className={S.icon}
      size={PIXELS[size]}
      strokeWidth={1.5}
      absoluteStrokeWidth={false}
      aria-hidden="true"
    />
  )
}
