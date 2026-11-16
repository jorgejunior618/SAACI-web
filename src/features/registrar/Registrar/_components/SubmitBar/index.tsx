import type { ReactNode } from 'react'

import { Button } from '@design-system'

import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

type SubmitBarProps = {
  /** `id` do formulário que o botão envia. O rodapé fica fora do `form`, na base da tela. */
  formId: string
  /** Horas que a atividade vai contar. `null` esconde a linha "Vai contar". */
  willCount: number | null
  /** A atividade não soma horas (item cheio ou antes do ingresso). Pinta o número de aviso. */
  isWarning: boolean
  /** Falta o comprovante ou o item: registrar é impossível, e o botão fica desabilitado. */
  isDisabled: boolean
}

/**
 * Mostra o rodapé fixo do registro: quanto a atividade vai contar e o botão Registrar.
 *
 * @remarks
 * Vai no `bottomNav` do `AppFrame`, colado na base ao rolar. O botão envia o formulário por `form`,
 * porque fica fora dele.
 */
export function SubmitBar({ formId, willCount, isWarning, isDisabled }: SubmitBarProps): ReactNode {
  return (
    <S.Root>
      {willCount === null ? null : (
        <S.Summary>
          <S.SummaryLabel>Vai contar</S.SummaryLabel>
          <S.SummaryValue tone={isWarning ? 'warning' : 'neutral'}>
            {formatHours(willCount)}
          </S.SummaryValue>
        </S.Summary>
      )}
      <Button type="submit" form={formId} block disabled={isDisabled}>
        Registrar
      </Button>
    </S.Root>
  )
}
