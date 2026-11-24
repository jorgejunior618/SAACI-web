// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Button } from '../../atoms/Button'
import * as S from './styles'

/** Props de {@link SubmitBar}. */
export type SubmitBarProps = {
  /** `id` do formulário que o botão envia. O rodapé fica fora do `form`, na base da tela. */
  formId: string
  /** Rótulo das horas, à esquerda ("Vai contar", "Vai contar (antes 1,0h)"). */
  summaryLabel: string
  /** Horas que a atividade vai contar, já calculadas. `null` esconde a linha de horas. */
  willCount: number | null
  /** A atividade vai contar menos do que vale (parcial ou não conta). Pinta o número de aviso. */
  isWarning?: boolean
  /** O formulário está sendo gravado. O botão mostra `busyLabel` e não envia de novo. */
  busy?: boolean
  /** Texto do botão durante a gravação, no gerúndio ("Registrando", "Salvando"). */
  busyLabel: string
  /** Texto do botão de envio ("Registrar", "Salvar correção"). */
  children: ReactNode
}

/**
 * Mostra o rodapé fixo de um formulário de atividade: quanto ela vai contar e o botão de envio.
 *
 * @remarks
 * Vai no `bottomNav` do `AppFrame`, colado na base ao rolar. O botão envia o formulário pelo
 * atributo `form`, porque fica fora dele. Recebe as horas prontas e só formata com `formatHours`
 * (RNF20). Quando mostrar o rodapé é decisão da tela.
 *
 * @example
 * ```tsx
 * <SubmitBar formId={formId} summaryLabel="Vai contar" willCount={10} busyLabel="Registrando">
 *   Registrar
 * </SubmitBar>
 * ```
 */
export function SubmitBar({
  formId,
  summaryLabel,
  willCount,
  isWarning = false,
  busy = false,
  busyLabel,
  children,
}: SubmitBarProps): ReactNode {
  return (
    <S.Root>
      {willCount === null ? null : (
        <S.Summary>
          <S.SummaryLabel>{summaryLabel}</S.SummaryLabel>
          <S.SummaryValue tone={isWarning ? 'warning' : 'neutral'}>
            {formatHours(willCount)}
          </S.SummaryValue>
        </S.Summary>
      )}
      <Button type="submit" form={formId} block busy={busy} busyLabel={busyLabel}>
        {children}
      </Button>
    </S.Root>
  )
}
