// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { FileUpload, SuggestionCard } from '@design-system'

import { PROOF_MAX_BYTES, PROOF_MIME_TYPES } from '@/services/activities'

import * as S from './styles'

const MAX_SIZE_MB = PROOF_MAX_BYTES / (1024 * 1024)

type ProofStepProps = {
  /** Comprovante anexado. `null` mostra os botões de foto e arquivo e os próximos passos. */
  file: File | null
  /** A leitura do comprovante está em andamento. */
  isReading: boolean
  /** Recebe o arquivo que passou na conferência de tipo e tamanho do `FileUpload`. */
  onSelect: (file: File) => void
  /** Chamado ao tocar em "Trocar". A tela limpa o arquivo, a leitura e o item. */
  onReplace: () => void
}

/**
 * Mostra o bloco do comprovante do registro: o anexo, os passos seguintes e a leitura em andamento.
 *
 * @remarks
 * Não lê o arquivo: quem chama `readProof` é a tela, ao receber `onSelect`. Sem arquivo, lista os
 * passos 2 e 3 do registro (o passo 1 é o próprio anexo).
 */
export function ProofStep({ file, isReading, onSelect, onReplace }: ProofStepProps): ReactNode {
  return (
    <S.Root>
      <FileUpload
        label="Comprovante"
        hint="PDF, JPG ou PNG, até 10 MB. Frente e verso? Junte os dois num PDF."
        accept={[...PROOF_MIME_TYPES]}
        maxSizeMb={MAX_SIZE_MB}
        file={file}
        onSelect={onSelect}
        onReplace={onReplace}
        notice="Um serviço de IA lê o seu comprovante."
        privacyLinkLabel="Saiba o que guardamos"
        privacyHref="/privacidade"
        privacyLinkAs={NextLink}
      />

      {file === null ? (
        <S.Steps>
          <S.Step>
            <S.Marker aria-hidden="true">2</S.Marker>
            <S.StepText>O app lê o certificado e sugere o item do formulário.</S.StepText>
          </S.Step>
          <S.Step>
            <S.Marker aria-hidden="true">3</S.Marker>
            <S.StepText>Você confere e vê quanto ela vale antes de registrar.</S.StepText>
          </S.Step>
        </S.Steps>
      ) : null}

      {isReading ? (
        <>
          <SuggestionCard status="reading" />
          <S.Support>
            A leitura só sugere. Você confere tudo, e nada é registrado antes de tocar em Registrar.
          </S.Support>
        </>
      ) : null}
    </S.Root>
  )
}
