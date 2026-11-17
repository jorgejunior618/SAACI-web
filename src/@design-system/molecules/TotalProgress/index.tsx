import type { ElementType, ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Button } from '../../atoms/Button'
import { Card } from '../../atoms/Card'
import { ProgressBar } from '../../atoms/ProgressBar'
import * as S from './styles'

export type TotalProgressProps = {
  /**
   * Horas que contam, prontas do cálculo único: o `totalHours` de `getProgress`, inteiro e já
   * limitado à meta. O componente mostra o número como chega, sem arredondar nem limitar.
   */
  doneHours: number
  /** Meta de horas do curso. Com `doneHours` igual a ela, o cartão vira o estado completo. */
  goalHours: number
  /**
   * Soma dos itens sem o limite da meta, o `itemsSum` de `getProgress`. Só serve para a frase do
   * excedente no estado completo; sem ela, a frase não aparece.
   */
  itemsSum?: number
  /** Destino do botão ao guia do formulário. Só aparece no estado completo; sem ele, não há botão. */
  guideHref?: string
  /** Elemento que desenha o botão do guia, como em `Button.as` (o `Link` do `next/link`). */
  linkAs?: ElementType
  /**
   * `compact` põe o número em 20px na mesma linha do rótulo, para telas que já têm outro número
   * grande, como a atividade registrada. Padrão: `default`, com o número em 56px.
   */
  size?: 'default' | 'compact'
}

/**
 * Mostra no topo do painel quantas horas faltam para a meta, com barra e linha de meta.
 *
 * @remarks
 * Não calcula: arredondar para baixo e limitar à meta é do cálculo único (`computeProgress`, RNF20),
 * e o componente mostra `doneHours` e `itemsSum` como chegam. O número tem 56px e a barra 6px.
 * Completo, o número vira a meta em `brand.text`, o rótulo diz que as horas foram cumpridas, uma
 * frase avisa quando os itens somam mais que a meta ("Seus itens somam 124,6h. O que passa de 120h
 * não é aproveitado."), um botão primário leva ao guia do formulário e a barra some. Com 0h o cartão
 * aparece com a barra vazia. Use um por tela. Com `size="compact"` o número fica em
 * 20px ao lado do rótulo ("47h faltam para completar suas horas"), e a tela pode ter outro número
 * grande.
 *
 * @example
 * ```tsx
 * <TotalProgress
 *   doneHours={progress.totalHours}
 *   goalHours={progress.targetHours}
 *   itemsSum={progress.itemsSum}
 * />
 * <TotalProgress doneHours={69} goalHours={120} size="compact" />
 * ```
 */
export function TotalProgress({
  doneHours,
  goalHours,
  itemsSum,
  guideHref,
  linkAs,
  size = 'default',
}: TotalProgressProps): ReactNode {
  const isComplete = doneHours >= goalHours
  const options = { fractionDigits: 0 } as const
  const isCompact = size === 'compact'

  if (isComplete) {
    return (
      <Card as="section" aria-label="Seu total de horas">
        <S.Head size={size}>
          <S.Total size={size} done>
            {formatHours(goalHours, options)}
          </S.Total>
          <S.Label size={size}>
            {isCompact ? 'feitas, você completou suas horas' : 'Você completou suas horas'}
          </S.Label>
        </S.Head>
        {itemsSum !== undefined && itemsSum > goalHours ? (
          <S.Surplus>
            Seus itens somam {formatHours(itemsSum)}. O que passa de{' '}
            {formatHours(goalHours, options)} não é aproveitado.
          </S.Surplus>
        ) : null}
        {guideHref ? (
          <S.GuideWrap>
            <Button as={linkAs ?? 'a'} href={guideHref} block>
              Ver como entregar seu pedido
            </Button>
          </S.GuideWrap>
        ) : null}
      </Card>
    )
  }

  return (
    <Card as="section" aria-label="Seu total de horas">
      <S.Head size={size}>
        <S.Total size={size}>{formatHours(goalHours - doneHours, options)}</S.Total>
        <S.Label size={size}>
          {isCompact ? 'faltam para completar suas horas' : 'Faltam para completar suas horas'}
        </S.Label>
      </S.Head>
      <S.BarWrap size={size}>
        <ProgressBar
          value={doneHours}
          max={goalHours}
          label={`${doneHours} de ${goalHours} horas`}
          size="md"
        />
      </S.BarWrap>
      <S.Meta>
        <span>{formatHours(doneHours, options)} feitas</span>
        <span>meta de {formatHours(goalHours, options)}</span>
      </S.Meta>
    </Card>
  )
}
