// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { useId } from 'react'
import type { ReactNode } from 'react'

import { formatBrDate } from '@/utils/br-date'
import type { FormRow } from '@/utils/coordination-form'
import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

/** Props de {@link FormSummary}. */
export type FormSummaryProps = {
  /** Todos os itens do curso, de `buildFormRows`. Só os que têm horas viram linha. */
  rows: FormRow[]
  /** Total do progresso, o mesmo número do painel. Nunca é somado aqui (RNF20). */
  totalHours: number
  /** Nome do curso, para a frase do modelo da coordenação. */
  courseName: string
  /** Data ISO em que a coordenação conferiu o modelo, de `Course.checkedAt`. `null`: sem data. */
  modelCheckedAt: string | null
  /** Aviso de que o excedente não entra no pedido, de `formatOverflowNote`. `null`: sem aviso. */
  overflowNote: string | null
  /** Frase dos itens sem hora, de `formatBlankRowsNote`. `null`: todos têm hora. */
  blankNote: string | null
}

/**
 * Tabela "O que vai no formulário": os itens com horas, os que ficam com traço e o total.
 *
 * @remarks
 * Mostra o que o PDF vai levar. Só os itens com horas ganham linha, e os demais entram numa frase
 * ("21 itens sem horas ficam com traço"), para a lista caber na tela do celular. O total chega
 * pronto do progresso. A frase do modelo só cita "conferido em" quando o curso tem a data, e nunca
 * inventa uma.
 *
 * @example
 * ```tsx
 * <FormSummary
 *   rows={buildFormRows(ruleItems, progress)}
 *   totalHours={progress.totalHours}
 *   courseName={course.name}
 *   modelCheckedAt={course.checkedAt}
 *   overflowNote={formatOverflowNote(progress)}
 *   blankNote={formatBlankRowsNote(rows)}
 * />
 * ```
 */
export function FormSummary({
  rows,
  totalHours,
  courseName,
  modelCheckedAt,
  overflowNote,
  blankNote,
}: FormSummaryProps): ReactNode {
  const headingId = useId()

  return (
    <S.Root aria-labelledby={headingId}>
      <S.Heading id={headingId}>O que vai no formulário</S.Heading>
      <S.TableBox>
        <S.Table>
          <thead>
            <tr>
              <S.HeadCell scope="col">Item</S.HeadCell>
              <S.HeadCell scope="col">Atividade</S.HeadCell>
              <S.HeadCell scope="col">CH Solicitada</S.HeadCell>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
              row.hours === null ? null : (
                <tr key={row.itemNumber}>
                  <S.Cell>{row.itemNumber}</S.Cell>
                  <S.NameCell title={row.name}>{row.name}</S.NameCell>
                  <S.HoursCell>{formatHours(row.hours)}</S.HoursCell>
                </tr>
              ),
            )}
            {blankNote ? (
              <tr>
                <S.NoteCell />
                <S.NoteCell>{blankNote}</S.NoteCell>
                <S.NoteCell>–</S.NoteCell>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr>
              <S.TotalCell />
              <S.TotalCell>Total</S.TotalCell>
              <S.TotalCell>{formatHours(totalHours, { fractionDigits: 0 })}</S.TotalCell>
            </tr>
          </tfoot>
        </S.Table>
      </S.TableBox>
      {overflowNote ? <S.Note>{overflowNote}</S.Note> : null}
      <S.Note>
        Modelo da coordenação de {courseName}
        {modelCheckedAt ? `, conferido em ${formatBrDate(modelCheckedAt)}` : ''}.
      </S.Note>
    </S.Root>
  )
}
