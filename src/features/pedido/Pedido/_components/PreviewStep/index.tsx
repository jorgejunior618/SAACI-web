'use client'

import { useMutation } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import type { ReactNode } from 'react'

import { AppFrame, Button, Notice, TopBar } from '@design-system'

import { saveFile } from '@/utils/save-file'

import { buildFileName, buildFormPdf, formatGeneratedAt, PdfCharacterError } from '../../utils'
import type { DownloadedFile, FormRow } from '../../utils'
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
  /** Momento em que o aluno abriu a prévia. O PDF leva o mesmo horário que a folha mostra. */
  generatedAt: Date
  /** Volta para a conferência. */
  onBack: () => void
  /** Chamado depois que o PDF foi gerado e entregue ao navegador. */
  onDownloaded: (file: DownloadedFile) => void
}

/**
 * Passo da prévia: a folha como o PDF vai sair e os botões para baixar o formulário.
 *
 * @remarks
 * "Baixar formulário em PDF" leva nome, matrícula e horas. "Baixar em branco" leva só os itens, para
 * quem prefere preencher à mão. O PDF é gerado no navegador (ADR 0010). Enquanto gera, o botão
 * fica ocupado e o outro não responde. Usa `useMutation` pelo ciclo de pendente e erro: baixar não
 * grava nada, então nada é invalidado. Se o PDF falha, nada é baixado e o texto diz o que fazer.
 *
 * @example
 * ```tsx
 * <PreviewStep
 *   header={formatFormHeader(course)}
 *   studentName={profile.name}
 *   enrollmentId={profile.enrollmentId}
 *   rows={rows}
 *   totalHours={progress.totalHours}
 *   generatedAt={generatedAt}
 *   onBack={() => setStep({ name: 'review' })}
 *   onDownloaded={(file) => setStep({ name: 'downloaded', file })}
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
  onBack,
  onDownloaded,
}: PreviewStepProps): ReactNode {
  const stamp = formatGeneratedAt(generatedAt)

  const generation = useMutation({
    mutationFn: async (isBlank: boolean) => {
      const blob = await buildFormPdf({
        header,
        studentName: studentName ?? '',
        enrollmentId: enrollmentId ?? '',
        rows,
        totalHours,
        generatedAt: stamp,
        isBlank,
      })

      return { blob, fileName: buildFileName(studentName, isBlank) }
    },
    onSuccess: ({ blob, fileName }) => {
      saveFile(blob, fileName)
      onDownloaded({ blob, fileName, generatedAt })
    },
  })

  const isGenerating = generation.isPending
  const isGeneratingBlank = isGenerating && generation.variables === true

  function generate(isBlank: boolean): void {
    if (!isGenerating) generation.mutate(isBlank)
  }

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Pré-visualizar" onBack={onBack} />}
      bottomNav={
        <S.Footer>
          {generation.isError ? (
            <Notice
              format="block"
              tone="danger"
              title={
                generation.error instanceof PdfCharacterError
                  ? 'O nome tem um caractere que o PDF não aceita'
                  : 'Não deu para gerar o PDF'
              }
            >
              {generation.error instanceof PdfCharacterError
                ? 'Nada foi baixado. Confira o nome no Perfil, use só letras com ou sem acento, e tente de novo.'
                : 'Nada foi baixado. Toque em Baixar de novo.'}
            </Notice>
          ) : null}
          {isGenerating ? (
            <S.Status role="status">
              Preenchendo os {rows.length} itens, leva alguns segundos
            </S.Status>
          ) : null}
          <Button
            block
            icon={Download}
            busy={isGenerating && !isGeneratingBlank}
            busyLabel="Gerando o PDF"
            onClick={() => generate(false)}
          >
            Baixar formulário em PDF
          </Button>
          <Button
            variant="tertiary"
            block
            busy={isGeneratingBlank}
            busyLabel="Gerando o PDF"
            onClick={() => generate(true)}
          >
            Baixar em branco
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
          generatedAt={stamp}
        />
        <S.Hint>Algo errado? Corrija a atividade em Atividades e o formulário se atualiza.</S.Hint>
      </S.Page>
    </AppFrame>
  )
}
