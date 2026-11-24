// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { ReactNode } from 'react'

import { semanticColors } from '@design-system/tokens/colors'

import { Section } from '../Section'
import { flattenColors, groupColors } from './utils'
import * as S from './styles'

const groups = groupColors(flattenColors(semanticColors))

/**
 * Página "Cores" da galeria: cada cor semântica com uma amostra grande e os valores dos dois temas.
 *
 * @remarks
 * A amostra grande usa a variável CSS do Panda e acompanha o tema do sistema. Os dois quadrados
 * menores mostram o valor fixo do claro e do escuro. Os valores vêm de `@design-system/tokens`, sem
 * hex repetido aqui.
 */
export function Colors(): ReactNode {
  return (
    <Section
      title="Cores"
      description="Todo componente usa o nome semântico, nunca o valor cru. A amostra grande segue o tema do sistema; os quadrados menores mostram o claro e o escuro lado a lado."
    >
      <S.Groups>
        {groups.map(({ name, swatches }) => (
          <S.Group key={name}>
            <S.GroupTitle>{name}</S.GroupTitle>
            <S.Grid>
              {swatches.map(({ name: colorName, cssVar, light, dark }) => (
                <S.Tile key={colorName}>
                  <S.Swatch style={{ background: cssVar }} />
                  <S.Info>
                    <S.Name>{colorName}</S.Name>
                    <S.Modes>
                      <S.Mode>
                        <S.Chip style={{ background: light.startsWith('{') ? cssVar : light }} />
                        <S.Detail>claro {light}</S.Detail>
                      </S.Mode>
                      <S.Mode>
                        <S.Chip style={{ background: dark.startsWith('{') ? cssVar : dark }} />
                        <S.Detail>escuro {dark}</S.Detail>
                      </S.Mode>
                    </S.Modes>
                  </S.Info>
                </S.Tile>
              ))}
            </S.Grid>
          </S.Group>
        ))}
      </S.Groups>
    </Section>
  )
}
