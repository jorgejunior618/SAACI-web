// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { textStyles } from '@design-system/tokens'

import { Section } from '../Section'
import * as S from './styles'

// Object.keys devolve string[]; as chaves vêm do próprio objeto, então o cast é seguro.
const names = Object.keys(textStyles) as Array<keyof typeof textStyles>

/** Página "Texto" da galeria: cada `textStyle` com uma amostra e as medidas. */
export function TextStyles(): ReactNode {
  return (
    <Section
      title="Texto"
      description="Estilos de texto do Panda, com a fonte Geist. Número de horas usa tabular-nums para a coluna alinhar."
    >
      <S.List>
        {names.map((name) => {
          const { fontSize, lineHeight, fontWeight } = textStyles[name].value

          return (
            <S.Row key={name}>
              <span className={S.textSamples[name]}>47h · 12,0h · Registrar atividade</span>
              <S.Detail>
                {name} · {fontSize} / {lineHeight} · peso {fontWeight}
              </S.Detail>
            </S.Row>
          )
        })}
      </S.List>
    </Section>
  )
}
