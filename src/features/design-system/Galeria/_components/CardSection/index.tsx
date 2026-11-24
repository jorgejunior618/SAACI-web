// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { Card } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import * as S from './styles'

/** Página "Card" da galeria: o cartão como `div`, como `article` com título e como link inteiro. */
export function CardSection(): ReactNode {
  return (
    <Section
      title="Card"
      description="Base dos cartões do app: fundo surface, borda de 1px em line, raio card e 16px de respiro. Sem sombra e sem variantes."
    >
      <S.Specimens>
        <Specimen isPlain label="padrão · div">
          <S.Wide>
            <Card>
              <S.Text>Conteúdo do cartão.</S.Text>
            </Card>
          </S.Wide>
        </Specimen>
        <Specimen isPlain label='as="article" · com título'>
          <S.Wide>
            <Card as="article">
              <S.Title>Ensino</S.Title>
              <S.Text>12,0h de 20h</S.Text>
            </Card>
          </S.Wide>
        </Specimen>
        <Specimen isPlain label='as="a" · cartão inteiro é link'>
          <S.Wide>
            <Card as="a" href="#exemplo" aria-label="Abrir Ensino">
              <S.Title>Ensino</S.Title>
              <S.Text>12,0h de 20h</S.Text>
            </Card>
          </S.Wide>
        </Specimen>
      </S.Specimens>
    </Section>
  )
}
