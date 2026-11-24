// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { Section } from '../Section'
import { Demo } from './_components/Demo'
import { Examples } from './_components/Examples'
import * as S from './styles'

/** Página "FileUpload" da galeria: os estados e uma área de teste que aceita arquivo de verdade. */
export function FileUploadSection(): ReactNode {
  return (
    <Section
      title="FileUpload"
      description="Anexa o comprovante por foto ou arquivo, com formatos e limite visíveis antes da escolha. Não envia nem lê o arquivo: devolve o File. Arrastar e soltar não existe, os dois botões são o caminho."
    >
      <S.Specimens>
        <Examples />
      </S.Specimens>
      <Demo />
    </Section>
  )
}
