// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import type { FormRow } from '@/utils/coordination-form'
import { formatHours } from '@/utils/format-hours'

import * as S from './styles'

/** Props de {@link FormPreview}. */
export type FormPreviewProps = {
  /** Linha de cima, com o campus e a coordenação. */
  header: string
  /** Nome do aluno. `null` ou vazio deixa a linha do campo em branco. */
  studentName: string | null
  /** Matrícula. `null` ou vazia deixa a linha do campo em branco. */
  enrollmentId: string | null
  /** Todos os itens do curso, de `buildFormRows`. Item sem hora vira traço. */
  rows: FormRow[]
  /** Total do progresso, o mesmo do PDF. Nunca é somado aqui (RNF20). */
  totalHours: number
  /** Data e hora de geração, já formatadas. */
  generatedAt: string
}

/**
 * Folha que mostra como o formulário vai sair no PDF, com todos os itens do curso.
 *
 * @remarks
 * É uma prévia fiel dos dados, não do desenho do PDF: a folha usa a fonte do app e cabe na tela do
 * celular, e o PDF usa a fonte padrão do formato. Nome e matrícula vazios aparecem como linha em
 * branco, para o aluno ver o que falta. A folha é clara nos dois temas, porque o papel também é.
 *
 * @example
 * ```tsx
 * <FormPreview
 *   header={formatFormHeader(course)}
 *   studentName={profile.name}
 *   enrollmentId={profile.enrollmentId}
 *   rows={rows}
 *   totalHours={progress.totalHours}
 *   generatedAt={formatGeneratedAt(generatedAt)}
 * />
 * ```
 */
export function FormPreview({
  header,
  studentName,
  enrollmentId,
  rows,
  totalHours,
  generatedAt,
}: FormPreviewProps): ReactNode {
  return (
    <S.Sheet aria-label="Prévia do formulário">
      <S.Header>{header}</S.Header>
      <S.Title>Formulário para Solicitação de Atividades Complementares</S.Title>
      <S.Fields>
        <S.FieldLabel>Aluno</S.FieldLabel>
        <S.FieldValue>{studentName}</S.FieldValue>
        <S.FieldLabel>Matrícula</S.FieldLabel>
        <S.FieldValue>{enrollmentId}</S.FieldValue>
      </S.Fields>
      <S.Table>
        <thead>
          <tr>
            <S.HeadCell scope="col">Item</S.HeadCell>
            <S.HeadCell scope="col">Atividade</S.HeadCell>
            <S.HeadCell scope="col">CH Solicitada</S.HeadCell>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.itemNumber}>
              <S.NumberCell>{row.itemNumber}</S.NumberCell>
              <S.NameCell title={row.name}>{row.name}</S.NameCell>
              {row.hours === null ? (
                <S.HoursCell>–</S.HoursCell>
              ) : (
                <S.FilledHoursCell>{formatHours(row.hours).replace(/h$/, '')}</S.FilledHoursCell>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <S.TotalHead />
            <S.TotalHead scope="row">Total</S.TotalHead>
            <S.TotalHead>
              {formatHours(totalHours, { fractionDigits: 0 }).replace(/h$/, '')}
            </S.TotalHead>
          </tr>
        </tfoot>
      </S.Table>
      <S.Stamp>Gerado pelo SAACI em {generatedAt}</S.Stamp>
    </S.Sheet>
  )
}
