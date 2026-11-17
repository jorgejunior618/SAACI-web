'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen, TotalProgress } from '@design-system'

import type { Activity } from '@/services/activities'
import type { Progress } from '@/services/progress'
import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

type RegisteredProps = {
  /** A atividade como o service gravou, já com `countedHours` do cálculo único. */
  activity: Activity
  /** O progresso já com a atividade nova, de `progressQueries.summary`. */
  progress: Progress
  /** "Registrar outra": a tela volta ao começo, sem arquivo nem campos. */
  onRegisterAnother: () => void
}

/**
 * Mostra a atividade registrada: quanto ela somou, em que item entrou e o total novo.
 *
 * @remarks
 * As horas e o total vêm prontos do service (RNF20). Atividade que não soma horas (item cheio ou
 * antes do ingresso) não ganha o número em destaque, e o texto diz que ela fica guardada. O total vai
 * em `size="compact"`, porque o número em destaque já é o número grande da tela.
 */
export function Registered({ activity, progress, onRegisterAnother }: RegisteredProps): ReactNode {
  const hasHours = activity.countedHours > 0
  const placement = `${activity.name} entrou no item ${activity.itemNumber}.`

  return (
    <AppFrame
      bottomNav={
        <S.Actions>
          <Button block onClick={onRegisterAnother}>
            Registrar outra
          </Button>
          <Button variant="secondary" as={NextLink} href="/inicio" block>
            Ver meu progresso
          </Button>
        </S.Actions>
      }
    >
      <S.Page>
        <StateScreen
          variant="success"
          highlight={
            hasHours
              ? `+${formatHours(activity.countedHours, { fractionDigits: 'auto' })}`
              : undefined
          }
          title="Atividade registrada"
          description={hasHours ? placement : `${placement} Ela fica guardada, mas não soma horas.`}
        />
        <TotalProgress
          doneHours={progress.totalHours}
          goalHours={progress.targetHours}
          itemsSum={progress.itemsSum}
          size="compact"
        />
      </S.Page>
    </AppFrame>
  )
}
