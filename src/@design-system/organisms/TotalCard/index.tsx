import type { ReactNode } from 'react'

import { formatHorasInteiras } from '@/utils/formatHoras'

import { Card } from '../../atoms/Card'
import { ProgressBar } from '../../atoms/ProgressBar'
import * as S from './styles'

type Props = {
  feito: number
  meta: number
  faltam: number
  // compact: o mini-total do sucesso do registro, com o número na mesma linha do rótulo.
  size?: 'hero' | 'compact'
  // Conteúdo extra do total completo (excedente e ação).
  children?: ReactNode
}

// O número é o herói. A barra nunca é a única fonte do valor.
export function TotalCard({ feito, meta, faltam, size = 'hero', children }: Props): ReactNode {
  const isDone = faltam === 0
  const numero = formatHorasInteiras(isDone ? meta : faltam)
  const rotulo = isDone
    ? 'Você completou suas horas'
    : size === 'compact'
      ? 'faltam para completar suas horas'
      : 'Faltam para completar suas horas'

  return (
    <Card aria-label="Seu total de horas">
      {size === 'compact' ? (
        <S.Inline>
          <span className={S.number({ size, isDone })}>{numero}</span>
          <S.Label>{rotulo}</S.Label>
        </S.Inline>
      ) : (
        <>
          <span className={S.number({ size, isDone })}>{numero}</span>
          <S.Label>{rotulo}</S.Label>
        </>
      )}
      {isDone && children ? (
        <S.Extra>{children}</S.Extra>
      ) : (
        <>
          <S.Bar>
            <ProgressBar
              value={feito}
              max={meta}
              size="lg"
              label={`${Math.min(feito, meta)} de ${meta} horas`}
            />
          </S.Bar>
          <S.Meta>
            <span>{formatHorasInteiras(feito)} feitas</span>
            <span>meta de {formatHorasInteiras(meta)}</span>
          </S.Meta>
        </>
      )}
    </Card>
  )
}
