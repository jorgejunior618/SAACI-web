// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { FileUpload } from '@design-system'

import { RangeControl, SwitchControl } from '../../../Controls'
import { Playground } from '../../../Playground'
import * as S from './styles'

/** Área de teste do `FileUpload`: escolha um arquivo de verdade para ver a conferência de tipo e tamanho. */
export function Demo(): ReactNode {
  const [file, setFile] = useState<File | null>(null)
  const [maxSizeMb, setMaxSizeMb] = useState(10)
  const [hasSendError, setHasSendError] = useState(false)

  return (
    <Playground
      controls={
        <>
          <RangeControl
            label="maxSizeMb"
            value={maxSizeMb}
            min={1}
            max={20}
            onChange={setMaxSizeMb}
          />
          <SwitchControl
            label="error (envio caiu)"
            checked={hasSendError}
            onChange={setHasSendError}
          />
        </>
      }
    >
      <S.Wrap>
        <FileUpload
          label="Comprovante"
          hint={`PDF, JPG ou PNG, até ${maxSizeMb} MB.`}
          accept={['application/pdf', 'image/jpeg', 'image/png']}
          maxSizeMb={maxSizeMb}
          file={file}
          error={
            hasSendError && file
              ? 'A conexão caiu. O arquivo continua anexado; toque em Registrar de novo.'
              : undefined
          }
          onSelect={setFile}
          onReplace={() => setFile(null)}
          notice="Um serviço de IA lê o seu comprovante."
          privacyLinkLabel="Saiba o que guardamos"
          privacyHref="#"
        />
      </S.Wrap>
    </Playground>
  )
}
