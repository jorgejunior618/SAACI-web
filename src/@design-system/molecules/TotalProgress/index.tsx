import type { ElementType, ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Card } from '../../atoms/Card'
import { Link } from '../../atoms/Link'
import { ProgressBar } from '../../atoms/ProgressBar'
import * as S from './styles'

export type TotalProgressProps = {
  /** Horas que já contam, já calculadas pelo service. Parte decimal é descartada na exibição. */
  doneHours: number
  /** Meta de horas do curso. Com `doneHours` igual ou acima dela, o cartão vira o estado completo. */
  goalHours: number
  /** Destino do link ao guia do formulário. Só aparece no estado completo; sem ele, não há link. */
  guideHref?: string
  /** Elemento que desenha o link do guia, como em `Link.as` (o `Link` do `next/link`). */
  linkAs?: ElementType
}

/**
 * Mostra no topo do painel quantas horas faltam para a meta, com barra e linha de meta.
 *
 * @remarks
 * O total é inteiro, arredondado para baixo, e para na meta: a barra nunca passa de 100% e o "falta"
 * nunca é negativo. Completo, o número vira a meta em `brand.text`, o rótulo diz que as horas foram
 * cumpridas, um link leva ao guia do formulário e a barra some. Use um por tela. Com 0h a tela usa
 * `StateScreen empty`, não este cartão com barra vazia. O componente não soma horas: recebe o valor
 * pronto (RNF20).
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
  const done = Math.min(Math.floor(doneHours), goalHours)
  const isComplete = done >= goalHours
  const options = { fractionDigits: 0 } as const

  if (isComplete) {
    return (
      <Card as="section" aria-label="Seu total de horas">
        <S.Total done>{formatHours(goalHours, options)}</S.Total>
        <S.Label>Você completou suas horas</S.Label>
        {guideHref ? (
          <S.GuideWrap>
            <Link as={linkAs} href={guideHref}>
              Ver como entregar seu pedido
            </Link>
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
        <ProgressBar value={done} max={goalHours} label={`${done} de ${goalHours} horas`} />
      </S.BarWrap>
      <S.Meta>
        <span>{formatHours(done, options)} feitas</span>
        <span>meta de {formatHours(goalHours, options)}</span>
      </S.Meta>
    </Card>
  )
}
