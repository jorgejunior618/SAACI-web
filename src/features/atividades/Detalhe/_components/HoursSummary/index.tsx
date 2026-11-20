import type { ReactNode } from 'react'

import { Card } from '@design-system'

import type { Activity } from '@/services/activities'
import { formatHours } from '@/utils/format-hours'

import type { CalcRow } from '../../utils'
import * as S from './styles'

type HoursSummaryProps = {
  activity: Activity
  /** A frase do porquê, de `describeWhy`. */
  why: string
  /** As linhas de "Como foi calculado", de `getCalcRows`. */
  calcRows: CalcRow[]
}

/**
 * Mostra quanto a atividade conta no total, por quê e como foi calculado.
 *
 * @remarks
 * Recebe tudo pronto e não calcula (RNF20): as horas vêm do service e as frases dos helpers da tela.
 * Na atividade que conta em parte, o número vem com o "de 2,0h" do quanto ela valeria.
 */
export function HoursSummary({ activity, why, calcRows }: HoursSummaryProps): ReactNode {
  const label =
    activity.status === 'parcial'
      ? `de ${formatHours(activity.activityHours)} contam no seu total`
      : 'contam no seu total'

  return (
    <Card as="section" aria-label="Quanto conta no seu total">
      <S.Hours>
        <S.HoursNumber status={activity.status}>{formatHours(activity.countedHours)}</S.HoursNumber>
        <S.HoursLabel>{label}</S.HoursLabel>
      </S.Hours>
      <S.Why>{why}</S.Why>

      <S.Table>
        <S.Caption>Como foi calculado</S.Caption>
        <tbody>
          {calcRows.map((row) => (
            <tr key={row.label}>
              <S.Label scope="row">{row.label}</S.Label>
              <S.Value>{formatHours(row.value)}</S.Value>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <S.TotalLabel scope="row">Conta no seu total</S.TotalLabel>
            <S.TotalValue>{formatHours(activity.countedHours)}</S.TotalValue>
          </tr>
        </tfoot>
      </S.Table>
    </Card>
  )
}
