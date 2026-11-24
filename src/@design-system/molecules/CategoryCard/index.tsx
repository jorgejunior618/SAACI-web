// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { ChevronRight } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Card } from '../../atoms/Card'
import { Icon } from '../../atoms/Icon'
import { ProgressBar } from '../../atoms/ProgressBar'
import * as S from './styles'

export type CategoryCardProps = {
  /** Número do item da tabela de atividades (7 vira "Item 7"). */
  itemNumber: number
  /** Nome do item. Passa de duas linhas, termina em reticências. */
  name: string
  /** Horas que contam neste item, já calculadas pelo service. Aparece com uma casa ("18,0h"). */
  countedHours: number
  /** Máximo de horas que o item aceita. Com `countedHours` igual ou acima dele, o cartão vira `full`. */
  maxHours: number
  /** Horas registradas além do máximo, que não contam. Só entra no rodapé do cartão `full`. */
  overflowHours?: number
  /** Destino do toque, em geral o item na tela Certificados. */
  href: string
  /** Elemento que desenha o link, como em `Link.as` (o `Link` do `next/link`). Padrão: `a`. */
  linkAs?: ElementType
}

/**
 * Mostra as horas que contam em um item, o máximo ao lado e quanto ainda cabe. O cartão inteiro é link.
 *
 * @remarks
 * Quando as horas chegam ao máximo, o número e o rodapé passam para `brand.text` e o rodapé diz que
 * está completo e quanto passou ("Completo. 4,0h registradas não contam"). Não há check nem badge.
 * Itens sem horas não viram cartão: vão para o `Disclosure`. A barra fica escondida de leitor de tela,
 * porque os números do texto já dizem o mesmo. Os valores chegam prontos (RNF20).
 *
 * @example
 * ```tsx
 * <CategoryCard
 *   itemNumber={7}
 *   name="Curso na área de engenharia de computação"
 *   countedHours={18}
 *   maxHours={60}
 *   href="/certificados?item=7"
 * />
 * ```
 */
export function CategoryCard({
  itemNumber,
  name,
  countedHours,
  maxHours,
  overflowHours = 0,
  href,
  linkAs,
}: CategoryCardProps): ReactNode {
  const isFull = countedHours >= maxHours
  const footer = isFull
    ? overflowHours > 0
      ? `Completo. ${formatHours(overflowHours)} registradas não contam`
      : 'Completo'
    : `Ainda cabem ${formatHours(maxHours - countedHours)}`

  return (
    <Card as={linkAs ?? 'a'} href={href}>
      <S.Head>
        <S.Titles>
          <S.ItemNumber>Item {itemNumber}</S.ItemNumber>
          <S.Name>{name}</S.Name>
        </S.Titles>
        <S.Arrow>
          <Icon icon={ChevronRight} size="sm" />
        </S.Arrow>
      </S.Head>
      <S.Hours>
        <S.Count full={isFull}>{formatHours(countedHours)}</S.Count>
        <S.Max>de {formatHours(maxHours, { fractionDigits: 0 })}</S.Max>
      </S.Hours>
      <S.BarWrap aria-hidden="true">
        <ProgressBar value={countedHours} max={maxHours} label={`Horas do item ${itemNumber}`} />
      </S.BarWrap>
      <S.Foot full={isFull}>{footer}</S.Foot>
    </Card>
  )
}
