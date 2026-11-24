// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { SubmitBar } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "SubmitBar" da galeria: registro, correção, aviso, gravando e sem número, e a área de teste. */
export function SubmitBarSection(): ReactNode {
  return (
    <Section
      title="SubmitBar"
      description="Rodapé fixo do formulário de atividade: quanto ela vai contar e o botão de envio. O número fica amarelo quando a atividade vai contar menos do que vale. Recebe as horas prontas."
    >
      <S.Specimens>
        <Specimen label="registro" isPlain>
          <S.Wrap>
            <SubmitBar formId="g1" summaryLabel="Vai contar" willCount={10} busyLabel="Registrando">
              Registrar
            </SubmitBar>
          </S.Wrap>
        </Specimen>
        <Specimen label="correção · isWarning" isPlain>
          <S.Wrap>
            <SubmitBar
              formId="g2"
              summaryLabel="Vai contar (antes 6,0h)"
              willCount={4}
              isWarning
              busyLabel="Salvando"
            >
              Salvar correção
            </SubmitBar>
          </S.Wrap>
        </Specimen>
        <Specimen label="busy" isPlain>
          <S.Wrap>
            <SubmitBar
              formId="g3"
              summaryLabel="Vai contar"
              willCount={10}
              busy
              busyLabel="Registrando"
            >
              Registrar
            </SubmitBar>
          </S.Wrap>
        </Specimen>
        <Specimen label="willCount={null}" isPlain>
          <S.Wrap>
            <SubmitBar
              formId="g4"
              summaryLabel="Vai contar"
              willCount={null}
              busyLabel="Registrando"
            >
              Registrar
            </SubmitBar>
          </S.Wrap>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
