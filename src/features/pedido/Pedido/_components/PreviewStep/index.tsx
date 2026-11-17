'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, Notice, TopBar } from '@design-system'

import { formatGeneratedAt } from '../../utils'
import type { FormRow } from '../../utils'
import { FormPreview } from '../FormPreview'
import * as S from './styles'

/** Props de {@link PreviewStep}. */
export type PreviewStepProps = {
  /** Linha de cima do formulário, com o campus e a coordenação. */
  header: string
  studentName: string | null
  enrollmentId: string | null
  /** Todos os itens do curso, de `buildFormRows`. */
  rows: FormRow[]
  /** Total do progresso. Nunca é somado aqui (RNF20). */
  totalHours: number
  /** Momento em que o aluno abriu a prévia. É o horário que a folha mostra. */
  generatedAt: Date
  /** Avisos do que falta, de `buildPreviewWarnings`. Lista vazia: nada falta. */
  warnings: string[]
  /** Volta para a conferência. */
  onBack: () => void
}

/**
 * Passo da prévia: a folha como o PDF vai sair e o botão que leva à entrega.
 *
 * @remarks
 * Só confere: o download do PDF e dos comprovantes fica no passo 1 do roadmap, na tela Como
 * entregar. O botão é um link para lá. O que falta (horas, nome) vira aviso acima do botão, sem
 * bloquear: o aluno decide se entrega assim. O PDF baixado leva o horário do download, que pode
 * ser depois do mostrado aqui.
 *
 * @example
 * ```tsx
 * <PreviewStep
 *   header={formatFormHeader(course)}
 *   studentName={profile.name}
 *   enrollmentId={profile.enrollmentId}
 *   rows={rows}
 *   totalHours={progress.totalHours}
 *   generatedAt={step.generatedAt}
 *   warnings={buildPreviewWarnings({ progress, profile })}
 *   onBack={() => setStep({ name: 'review' })}
 * />
 * ```
 */
export function PreviewStep({
  header,
  studentName,
  enrollmentId,
  rows,
  totalHours,
  generatedAt,
  warnings,
  onBack,
}: PreviewStepProps): ReactNode {
  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Pré-visualizar" onBack={onBack} />}
      bottomNav={
        <S.Footer>
          {warnings.map((warning) => (
            <Notice key={warning} tone="warning">
              {warning}
            </Notice>
          ))}
          <Button as={NextLink} href="/atividades/pedido/como-entregar" block>
            Continuar para a entrega
          </Button>
        </S.Footer>
      }
    >
      <S.Page>
        <S.Hint>É assim que o PDF vai sair. Confira nome, matrícula e as horas.</S.Hint>
        <FormPreview
          header={header}
          studentName={studentName}
          enrollmentId={enrollmentId}
          rows={rows}
          totalHours={totalHours}
          generatedAt={formatGeneratedAt(generatedAt)}
        />
        <S.Hint>Algo errado? Corrija a atividade em Atividades e o formulário se atualiza.</S.Hint>
      </S.Page>
    </AppFrame>
  )
}
