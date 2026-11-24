// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import * as S from './styles'

/** Estado que a cor do texto reforça: neutro, conta, conta em parte ou não conta. */
export type BadgeTone = 'neutral' | 'counts' | 'partial' | 'doesNotCount'

export type BadgeProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /** Cor do texto. O fundo é sempre o mesmo neutro. Padrão: `neutral`. */
  tone?: BadgeTone
  /** No máximo três palavras, e a palavra carrega o significado ("Conta", "Não conta"). */
  children: ReactNode
}

/**
 * Etiqueta curta de estado: texto de 12px sobre `surface.muted`, com a cor do texto dizendo o estado.
 *
 * @remarks
 * Não tem ícone nem ação, e não é botão. A cor só reforça: o significado está na palavra. Dentro de
 * lista de atividades, prefira colorir a própria duração; o Badge serve quando o estado aparece
 * sozinho, como no detalhe da atividade. Não crie um quinto tom: o que não cabe vira texto.
 *
 * @example
 * ```tsx
 * <Badge tone="partial">Conta em parte</Badge>
 * ```
 */
export function Badge({ tone = 'neutral', ...rest }: BadgeProps): ReactNode {
  return <S.Root tone={tone} {...rest} />
}
