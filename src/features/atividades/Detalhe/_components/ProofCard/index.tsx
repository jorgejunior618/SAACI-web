// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useMutation } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, Icon, Link, Notice } from '@design-system'

import { getProofFile, getProofUrl } from '@/services/activities'
import type { Activity } from '@/services/activities'
import { formatFileSize } from '@/utils/format-file-size'
import { saveFile } from '@/utils/save-file'

import * as S from './styles'

type ProofCardProps = {
  activity: Activity
}

/**
 * Mostra o comprovante da atividade, com Ver (abre em outra aba) e Baixar.
 *
 * @remarks
 * Ver abre a aba **antes** de pedir o endereço assinado (`getProofUrl`): aberta depois de uma espera,
 * o navegador bloquearia como pop-up. Se o endereço não vier, a aba fecha e o aviso diz o que fazer.
 * Baixar busca o arquivo (`getProofFile`) e entrega com o nome original. Só um aviso aparece por vez,
 * o da última ação.
 */
export function ProofCard({ activity }: ProofCardProps): ReactNode {
  const { id, proof } = activity
  const opening = useMutation({
    mutationFn: async (tab: Window | null) => {
      const url = await getProofUrl(id)

      if (tab) tab.location.href = url
      else window.location.assign(url)
    },
    onError: (_error, tab) => tab?.close(),
  })
  const downloading = useMutation({
    mutationFn: async () => saveFile(await getProofFile(id), proof.fileName),
  })

  function handleOpen(): void {
    downloading.reset()
    const tab = window.open('', '_blank')

    // Sem `noopener` no `open` para manter a referência; o corte com esta aba vem aqui.
    if (tab) tab.opener = null
    opening.mutate(tab)
  }

  function handleDownload(): void {
    opening.reset()
    downloading.mutate()
  }

  return (
    <Card as="section" aria-label="Comprovante">
      <S.Row>
        <S.FileIcon>
          <Icon icon={FileText} size="md" />
        </S.FileIcon>
        <S.File>
          <S.FileName title={proof.fileName}>{proof.fileName}</S.FileName>
          <S.FileSize>{formatFileSize(proof.sizeBytes)}</S.FileSize>
        </S.File>
        <S.Actions>
          <Link
            as="button"
            type="button"
            isStandalone
            aria-busy={opening.isPending}
            onClick={opening.isPending ? undefined : handleOpen}
          >
            {opening.isPending ? 'Abrindo' : 'Ver'}
          </Link>
          <Link
            as="button"
            type="button"
            isStandalone
            aria-busy={downloading.isPending}
            onClick={downloading.isPending ? undefined : handleDownload}
          >
            {downloading.isPending ? 'Baixando' : 'Baixar'}
          </Link>
        </S.Actions>
      </S.Row>
      {opening.isError ? (
        <S.ErrorWrap>
          <Notice tone="danger" role="alert">
            Não conseguimos abrir o comprovante. Confira a internet e toque em Ver de novo.
          </Notice>
        </S.ErrorWrap>
      ) : null}
      {downloading.isError ? (
        <S.ErrorWrap>
          <Notice tone="danger" role="alert">
            Não conseguimos baixar o comprovante. Confira a internet e toque em Baixar de novo.
          </Notice>
        </S.ErrorWrap>
      ) : null}
    </Card>
  )
}
