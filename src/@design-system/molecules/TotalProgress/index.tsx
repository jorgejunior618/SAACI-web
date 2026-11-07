import type { ElementType, ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Button } from '../../atoms/Button'
import { Card } from '../../atoms/Card'
import { ProgressBar } from '../../atoms/ProgressBar'
import * as S from './styles'

export type TotalProgressProps = {
  /** Horas que já contam, já calculadas pelo service. Parte decimal é descartada na exibição. */
  doneHours: number
  /** Meta de horas do curso. Com `doneHours` igual ou acima dela, o cartão vira o estado completo. */
  goalHours: number
  /** Destino do botão ao guia do formulário. Só aparece no estado completo; sem ele, não há botão. */
  guideHref?: string
  /** Elemento que desenha o botão do guia, como em `Button.as` (o `Link` do `next/link`). */
  linkAs?: ElementType
}

/**
 * Mostra no topo do painel quantas horas faltam para a meta, com barra e linha de meta.
 *
 * @remarks
 * O total é inteiro, arredondado para baixo, e para na meta: a barra nunca passa de 100% e o "falta"
 * nunca é negativo. O número tem 56px e a barra 6px. Completo, o número vira a meta em `brand.text`,
 * o rótulo diz que as horas foram cumpridas, uma frase avisa quando os itens somam mais que a meta
 * ("Seus itens somam 124h. O que passa de 120h não é aproveitado."), um botão primário leva ao guia
 * do formulário e a barra some. Com 0h o cartão aparece com a barra vazia. Use um por tela. O
 * componente não soma horas: recebe o valor pronto (RNF20).
 *
 * @example
 * ```tsx
 * <TotalProgress doneHours={73} goalHours={120} />
 * ```
 */
export function TotalProgress({
  doneHours,
  goalHours,
  guideHref,
  linkAs,
}: TotalProgressProps): ReactNode {
  const total = Math.floor(doneHours)
  const done = Math.min(total, goalHours)
  const isComplete = done >= goalHours
  const options = { fractionDigits: 0 } as const

  if (isComplete) {
    return (
      <Card as="section" aria-label="Seu total de horas">
        <S.Total done>{formatHours(goalHours, options)}</S.Total>
        <S.Label>Você completou suas horas</S.Label>
        {total > goalHours ? (
          <S.Surplus>
            Seus itens somam {formatHours(total, options)}. O que passa de{' '}
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
      <S.Total>{formatHours(goalHours - done, options)}</S.Total>
      <S.Label>Faltam para completar suas horas</S.Label>
      <S.BarWrap>
        <ProgressBar
          value={done}
          max={goalHours}
          label={`${done} de ${goalHours} horas`}
          size="md"
        />
      </S.BarWrap>
      <S.Meta>
        <span>{formatHours(done, options)} feitas</span>
        <span>meta de {formatHours(goalHours, options)}</span>
      </S.Meta>
    </Card>
  )
}
