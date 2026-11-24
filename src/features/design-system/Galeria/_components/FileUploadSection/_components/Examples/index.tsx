// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import type { ReactNode } from 'react'

import { FileUpload } from '@design-system'

import { Specimen } from '../../../Specimen'
import { fakeFile } from '../../fakeFile'
import * as S from './styles'

const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']
const HINT =
  'PDF, JPG ou PNG, até 10 MB. Se o certificado tem frente e verso, junte os dois num PDF.'
const LONG_NAME = 'certificado-semana-engenharia-de-computacao-2025.pdf'

function noop(): void {}

/** Exemplos do `FileUpload` em cada estado. Ficam num componente de cliente porque recebem funções. */
export function Examples(): ReactNode {
  const common = {
    label: 'Comprovante',
    hint: HINT,
    accept: ACCEPT,
    maxSizeMb: 10,
    onSelect: noop,
    onReplace: noop,
    notice: 'Um serviço de IA lê o seu comprovante.',
    privacyLinkLabel: 'Saiba o que guardamos',
    privacyHref: '#',
  }

  return (
    <>
      <Specimen label="vazio · antes de escolher">
        <S.Wide>
          <FileUpload {...common} />
        </S.Wide>
      </Specimen>
      <Specimen label="file · nome truncado, tamanho e Trocar">
        <S.Wide>
          <FileUpload {...common} file={fakeFile(LONG_NAME, 1.2 * 1024 * 1024)} />
        </S.Wide>
      </Specimen>
      <Specimen label="error · tipo não aceito">
        <S.Wide>
          <FileUpload
            {...common}
            error="Esse tipo de arquivo não funciona aqui. Envie em PDF, JPG ou PNG."
          />
        </S.Wide>
      </Specimen>
      <Specimen label="error · envio caiu, arquivo continua">
        <S.Wide>
          <FileUpload
            {...common}
            file={fakeFile(LONG_NAME, 1.2 * 1024 * 1024)}
            error="A conexão caiu. O arquivo continua anexado e os campos continuam preenchidos; toque em Registrar de novo."
          />
        </S.Wide>
      </Specimen>
    </>
  )
}
