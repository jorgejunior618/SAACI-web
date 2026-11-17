'use client'

import { useMutation } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button, Link, Notice } from '@design-system'

import {
  buildFileName,
  buildFormPdf,
  formatGeneratedAt,
  PdfCharacterError,
} from '@/utils/coordination-form'
import type { FormRow } from '@/utils/coordination-form'
import { saveFile } from '@/utils/save-file'

import * as S from './styles'

/** Dados do formulário que o PDF leva. Todos chegam prontos (RNF20). */
export type FormDownloadData = {
  /** Linha de cima do formulário, com o campus e a coordenação. */
  header: string
  /** `null` quando o nome ainda não foi escrito. O PDF sai com a linha em branco. */
  studentName: string | null
  /** `null` quando a matrícula não foi informada. O PDF sai com a linha em branco. */
  enrollmentId: string | null
  /** Todos os itens do curso, de `buildFormRows`. */
  rows: FormRow[]
  /** Total do progresso. Nunca é somado aqui. */
  totalHours: number
}

/** Props de {@link FormDownload}. */
export type FormDownloadProps = FormDownloadData & {
  /**
   * Chamado depois que o formulário preenchido foi entregue ao navegador. A versão em branco não
   * chama, porque não é o formulário do aluno.
   */
  onDownloaded: () => void
}

// Abre o PDF numa aba nova. O endereço é liberado depois, para a aba ter tempo de ler o arquivo.
function openFile(blob: Blob): void {
  const url = URL.createObjectURL(blob)

  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/**
 * Botões que geram e baixam o formulário da coordenação: preenchido e em branco.
 *
 * @remarks
 * O PDF é gerado no navegador (ADR 0010) com o horário do toque. Enquanto gera, o botão tocado fica
 * ocupado e o outro não responde. Usa `useMutation` pelo ciclo de pendente e erro: baixar não grava
 * nada, então nada é invalidado. Se falha, nada é baixado e o texto diz o que fazer, e nome com
 * caractere que o PDF não aceita manda conferir o Perfil. Depois de baixar, "Abrir o PDF" mostra o
 * arquivo na própria tela.
 *
 * @example
 * ```tsx
 * <FormDownload {...formData} onDownloaded={() => markAsDone('form')} />
 * ```
 */
export function FormDownload({
  header,
  studentName,
  enrollmentId,
  rows,
  totalHours,
  onDownloaded,
}: FormDownloadProps): ReactNode {
  const generation = useMutation({
    mutationFn: async (isBlank: boolean) => {
      const blob = await buildFormPdf({
        header,
        studentName: studentName ?? '',
        enrollmentId: enrollmentId ?? '',
        rows,
        totalHours,
        generatedAt: formatGeneratedAt(new Date()),
        isBlank,
      })

      return { blob, isBlank, fileName: buildFileName(studentName, isBlank) }
    },
    onSuccess: ({ blob, isBlank, fileName }) => {
      saveFile(blob, fileName)
      if (!isBlank) onDownloaded()
    },
  })

  const isGenerating = generation.isPending
  const isGeneratingBlank = isGenerating && generation.variables === true
  const saved = generation.data

  function generate(isBlank: boolean): void {
    if (!isGenerating) generation.mutate(isBlank)
  }

  return (
    <S.Root>
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
      {isGenerating ? (
        <S.Status role="status">Preenchendo os {rows.length} itens, leva alguns segundos</S.Status>
      ) : null}
      {generation.isError ? (
        <Notice tone="danger">
          {generation.error instanceof PdfCharacterError
            ? 'O nome tem um caractere que o PDF não aceita. Nada foi baixado. Confira o nome no Perfil, use só letras com ou sem acento, e tente de novo.'
            : 'Não deu para gerar o PDF. Nada foi baixado. Toque em Baixar de novo.'}
        </Notice>
      ) : null}
      {saved && !isGenerating && !generation.isError ? (
        <>
          <Notice tone="success">{saved.fileName} está nos downloads do aparelho.</Notice>
          <Link as="button" type="button" isStandalone onClick={() => openFile(saved.blob)}>
            Abrir o PDF
          </Link>
        </>
      ) : null}
    </S.Root>
  )
}
