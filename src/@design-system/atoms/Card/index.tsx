// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import * as S from './styles'

export type CardProps<T extends ElementType = 'div'> = {
  /**
   * Elemento ou componente que desenha o cartão. Padrão: `div`. As demais props seguem o elemento
   * escolhido (`href` com `a`).
   * Use `section` ou `article` quando o cartão tiver título, ou o `Link` do `next/link` quando ele inteiro for um link.
   */
  as?: T
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

/**
 * Cartão neutro: fundo `surface`, borda de 1px em `line`, raio `card` e 16px de respiro.
 *
 * @remarks
 * É a base de CategoryCard, SuggestionCard e RulePanel. Não tem variantes: o que muda de um cartão
 * para outro é o conteúdo. Cartão que é link inteiro precisa de rótulo acessível próprio.
 *
 * @example
 * ```tsx
 * <Card as="a" href="/atividades" aria-label="Abrir Ensino">
 *   Ensino
 * </Card>
 * ```
 */
export function Card<T extends ElementType = 'div'>(props: CardProps<T>): ReactNode
export function Card({ as, ...rest }: CardProps<ElementType>): ReactNode {
  return <S.Root as={as} {...rest} />
}
