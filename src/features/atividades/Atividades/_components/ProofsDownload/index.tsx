'use client'

import { useMutation } from '@tanstack/react-query'
import type { Zippable } from 'fflate'
import { Download } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Button, Notice, ProgressBar, Spinner } from '@design-system'

import { getProofFile } from '@/services/activities'
import type { Activity } from '@/services/activities'
import type { RuleItem } from '@/services/rules'
import { saveFile } from '@/utils/save-file'

import {
  formatFileCount,
  formatLeftOut,
  formatMegabytes,
  formatSelectedLabel,
  getProofEntries,
} from '../../utils'
import type { ProofEntry } from '../../utils'
import * as S from './styles'

/** Nome do arquivo que vai para os downloads do aparelho. */
const ZIP_NAME = 'comprovantes-saaci.zip'

// Quanto já chegou: arquivos e bytes (pelo `sizeBytes` guardado, o mesmo do total anunciado).
type DownloadProgress = { files: number; bytes: number }

/** Props de {@link ProofsDownload}. */
export type ProofsDownloadProps = {
  /** Todas as atividades do aluno. Só as que contam entram no arquivo. */
  activities: Activity[]
  /** Itens do curso, para o nome da pasta de cada item. */
  ruleItems: RuleItem[]
  /**
   * Comprovantes marcados no modo "Escolher quais". `null` ou ausente: fora do modo, entram todos
   * os que contam. Um `Set` vazio é o aluno com tudo desmarcado.
   */
  selectedIds?: ReadonlySet<string> | null
}

// Baixa um comprovante por vez, para o progresso andar arquivo a arquivo, e monta o zip no fim. O
// `fflate` só é carregado aqui, no clique. Sem compressão: PDF e imagem já vêm compactados.
// Cancelado, devolve `null` em vez de erro: cancelar não é falha.
async function zipProofs(
  entries: ProofEntry[],
  signal: AbortSignal,
  onProgress: (progress: DownloadProgress) => void,
): Promise<Blob | null> {
  try {
    const files: Zippable = {}
    let bytes = 0

    for (const [index, entry] of entries.entries()) {
      const file = await getProofFile(entry.activity.id, signal)

      files[entry.path] = new Uint8Array(await file.arrayBuffer())
      bytes += entry.activity.proof.sizeBytes
      onProgress({ files: index + 1, bytes })
    }

    signal.throwIfAborted()
    const { zipSync } = await import('fflate')

    return new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' })
  } catch (error) {
    if (signal.aborted) return null
    throw error
  }
}

/**
 * Parte do cartão de Atividades que baixa os comprovantes que contam num arquivo compactado, com uma
 * pasta por item.
 *
 * @remarks
 * Três estados, como no protótipo: parado (botão, tamanho e quem fica de fora), baixando (progresso
 * por arquivo e por MB, com "Cancelar download") e erro (nada foi salvo, "Tentar de novo"). O
 * arquivo é montado no navegador (ADR 0008). Usa `useMutation` pelo ciclo de pendente e erro, mas
 * não invalida nada: baixar não grava. O `onSuccess` fica nas opções do `useMutation`, então o
 * arquivo é salvo mesmo se o aluno mudar de tela no meio. Sem comprovante que conte, não mostra nada.
 * Com `selectedIds`, entram só os marcados e o botão diz quantos. Com nada marcado, o botão continua
 * ativo e o toque explica o que fazer, em vez de não responder.
 *
 * @example
 * ```tsx
 * <Card>
 *   <ProofsDownload activities={activities} ruleItems={ruleItems} />
 * </Card>
 * ```
 */
export function ProofsDownload({
  activities,
  ruleItems,
  selectedIds = null,
}: ProofsDownloadProps): ReactNode {
  const allEntries = getProofEntries(activities, ruleItems)
  const entries = selectedIds
    ? allEntries.filter((entry) => selectedIds.has(entry.activity.id))
    : allEntries
  const totalBytes = entries.reduce((sum, entry) => sum + entry.activity.proof.sizeBytes, 0)
  const leftOut = formatLeftOut(activities)

  const controller = useRef<AbortController | null>(null)
  const [progress, setProgress] = useState<DownloadProgress>({ files: 0, bytes: 0 })
  const [hasTriedEmpty, setHasTriedEmpty] = useState(false)

  const mutation = useMutation({
    mutationFn: () => {
      const abort = new AbortController()

      controller.current = abort
      setProgress({ files: 0, bytes: 0 })
      return zipProofs(entries, abort.signal, setProgress)
    },
    onSuccess: (zip) => {
      if (zip) saveFile(zip, ZIP_NAME)
    },
  })

  if (allEntries.length === 0) return null

  const isNothingSelected = entries.length === 0

  function download(): void {
    if (isNothingSelected) {
      setHasTriedEmpty(true)
      return
    }
    setHasTriedEmpty(false)
    mutation.mutate()
  }

  if (mutation.isPending) {
    return (
      <S.Root>
        <S.Status>
          <Spinner label="Juntando seus comprovantes" />
          <span aria-hidden="true">Juntando seus comprovantes</span>
        </S.Status>
        <ProgressBar value={progress.bytes} max={totalBytes} label="Comprovantes juntados" />
        <S.Counts>
          <span>
            {progress.files} de {formatFileCount(entries.length)}
          </span>
          <span>
            {formatMegabytes(progress.bytes, { hasUnit: false })} de {formatMegabytes(totalBytes)}
          </span>
        </S.Counts>
        <S.Help>Pode continuar usando o app. O arquivo vai para os downloads do celular.</S.Help>
        <S.Actions>
          <Button variant="tertiary" onClick={() => controller.current?.abort()}>
            Cancelar download
          </Button>
        </S.Actions>
      </S.Root>
    )
  }

  if (mutation.isError) {
    return (
      <S.Root>
        <Notice format="block" tone="danger" inCard title="O download parou no meio">
          Nada foi salvo no celular. Confira sua internet e tente de novo. Se continuar, abra uma
          atividade e baixe o comprovante dela sozinho.
        </Notice>
        <Button block onClick={download}>
          Tentar de novo
        </Button>
      </S.Root>
    )
  }

  return (
    <S.Root>
      <Button block icon={Download} onClick={download}>
        {selectedIds ? formatSelectedLabel(entries.length) : 'Baixar os que contam'}
      </Button>
      {isNothingSelected && hasTriedEmpty ? (
        <Notice tone="danger">
          Nenhum comprovante marcado. Marque ao menos um na lista de cada item para baixar.
        </Notice>
      ) : null}
      {isNothingSelected ? null : (
        <S.Help>
          {formatFileCount(entries.length)}, cerca de {formatMegabytes(totalBytes)}. Vem num arquivo
          compactado com uma pasta por item.
        </S.Help>
      )}
      {leftOut ? (
        <Notice tone="danger" role="status">
          {leftOut}
        </Notice>
      ) : null}
    </S.Root>
  )
}
