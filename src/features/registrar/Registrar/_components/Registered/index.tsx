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

// "+10h" quando é inteiro, "+2,5h" quando não é: nunca esconde a parte decimal.
function formatGain(hours: number): string {
  return `+${formatHours(hours, { fractionDigits: Number.isInteger(hours) ? 0 : 1 })}`
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
  const isComplete = progress.totalHours >= progress.targetHours
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
          highlight={hasHours ? formatGain(activity.countedHours) : undefined}
          title="Atividade registrada"
          description={hasHours ? placement : `${placement} Ela fica guardada, mas não soma horas.`}
        />
        <TotalProgress
          doneHours={isComplete ? progress.itemsSum : progress.totalHours}
          goalHours={progress.targetHours}
          size="compact"
        />
      </S.Page>
    </AppFrame>
  )
}
