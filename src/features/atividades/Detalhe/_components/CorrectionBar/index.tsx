import type { ReactNode } from 'react'

import { Button } from '@design-system'

import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

type CorrectionBarProps = {
  /** `id` do formulário que o botão envia. O rodapé fica fora do `form`, na base da tela. */
  formId: string
  /** Horas que a atividade vai contar com a correção. `null` esconde a linha "Vai contar". */
  willCount: number | null
  /** Horas que ela conta hoje, o "antes" da linha. */
  countedBefore: number
  /** A atividade vai contar menos do que vale. Pinta o número de aviso. */
  isWarning: boolean
  /** A correção está sendo gravada. O botão mostra "Salvando" e não envia de novo. */
  isBusy: boolean
}

/**
 * Mostra o rodapé fixo da correção: quanto a atividade vai contar, quanto contava, e Salvar correção.
 *
 * @remarks
 * Vai no `bottomNav` do `AppFrame`, colado na base ao rolar. O botão envia o formulário por `form`,
 * porque fica fora dele.
 */
export function CorrectionBar({
  formId,
  willCount,
  countedBefore,
  isWarning,
  isBusy,
}: CorrectionBarProps): ReactNode {
  return (
    <S.Root>
      {willCount === null ? null : (
        <S.Summary>
          <S.SummaryLabel>Vai contar (antes {formatHours(countedBefore)})</S.SummaryLabel>
          <S.SummaryValue tone={isWarning ? 'warning' : 'neutral'}>
            {formatHours(willCount)}
          </S.SummaryValue>
        </S.Summary>
      )}
      <Button type="submit" form={formId} block busy={isBusy} busyLabel="Salvando">
        Salvar correção
      </Button>
    </S.Root>
  )
}
