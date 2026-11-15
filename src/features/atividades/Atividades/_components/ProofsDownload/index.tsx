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

import { formatFileCount, formatLeftOut, formatMegabytes, getProofEntries } from '../../utils'
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

// Entrega o arquivo ao navegador como download. O endereço é liberado depois, para o navegador ter
// tempo de começar a gravar.
function saveFile(file: Blob, name: string): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/**
 * Parte do cartão de Atividades que baixa os comprovantes que contam num arquivo compactado, com uma
 * pasta por item.
 *
 * @remarks
 * Três estados, como no protótipo: parado (botão, tamanho e quem fica de fora), baixando (progresso
 * por arquivo e por MB, com "Cancelar download") e erro (nada foi salvo, "Tentar de novo"). O
 * arquivo é montado no navegador (ADR 0007). Usa `useMutation` pelo ciclo de pendente e erro, mas
 * não invalida nada: baixar não grava. O `onSuccess` fica nas opções do `useMutation`, então o
 * arquivo é salvo mesmo se o aluno mudar de tela no meio. Sem comprovante que conte, não mostra nada.
 *
 * @example
 * ```tsx
 * <Card>
 *   <ProofsDownload activities={activities} ruleItems={ruleItems} />
 * </Card>
 * ```
 */
export function ProofsDownload({ activities, ruleItems }: ProofsDownloadProps): ReactNode {
  const entries = getProofEntries(activities, ruleItems)
  const totalBytes = entries.reduce((sum, entry) => sum + entry.activity.proof.sizeBytes, 0)
  const leftOut = formatLeftOut(activities)

  const controller = useRef<AbortController | null>(null)
  const [progress, setProgress] = useState<DownloadProgress>({ files: 0, bytes: 0 })

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

  if (entries.length === 0) return null

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
            {formatMegabytes(progress.bytes, { withUnit: false })} de {formatMegabytes(totalBytes)}
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
        <Button block onClick={() => mutation.mutate()}>
          Tentar de novo
        </Button>
      </S.Root>
    )
  }

  return (
    <S.Root>
      <Button block icon={Download} onClick={() => mutation.mutate()}>
        Baixar os que contam
      </Button>
      <S.Help>
        {formatFileCount(entries.length)}, cerca de {formatMegabytes(totalBytes)}. Vem num arquivo
        compactado com uma pasta por item.
      </S.Help>
      {leftOut ? (
        <Notice tone="danger" role="status">
          {leftOut}
        </Notice>
      ) : null}
    </S.Root>
  )
}
