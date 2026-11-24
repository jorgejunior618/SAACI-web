// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { ProgressBar } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "ProgressBar" da galeria: vazia, parcial, cheia, com excesso e a área de teste. */
export function ProgressBarSection(): ReactNode {
  return (
    <Section
      title="ProgressBar"
      description="Barra de 4px (ou 6px no total do painel) com trilho sutil e role progressbar. Valor acima do máximo enche a barra e não estoura o trilho. O número da barra é texto de quem usa."
    >
      <S.Specimens>
        <Specimen label="value=0 · vazia">
          <S.Wrap>
            <ProgressBar value={0} max={20} label="Horas de Ensino" />
          </S.Wrap>
        </Specimen>
        <Specimen label="value=12 max=20 · parcial">
          <S.Wrap>
            <ProgressBar value={12} max={20} label="Horas de Extensão" />
          </S.Wrap>
        </Specimen>
        <Specimen label="value=20 max=20 · completa">
          <S.Wrap>
            <ProgressBar value={20} max={20} label="Horas de Pesquisa" />
          </S.Wrap>
        </Specimen>
        <Specimen label="value=30 max=20 · corta em max">
          <S.Wrap>
            <ProgressBar value={30} max={20} label="Horas de Cultura" />
          </S.Wrap>
        </Specimen>
        <Specimen label='size="md" · 6px, total do painel'>
          <S.Wrap>
            <ProgressBar value={12} max={20} label="Total de horas" size="md" />
          </S.Wrap>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
