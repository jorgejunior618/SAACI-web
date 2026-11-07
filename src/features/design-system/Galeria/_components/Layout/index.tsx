import type { ReactNode } from 'react'

import { tokens } from '@design-system/tokens'

import { Section } from '../Section'
import * as S from './styles'

/**
 * Página "Espaço e forma" da galeria: escala de espaço, raios e tamanhos fixos.
 *
 * @remarks
 * Larguras e raios vão em `style` inline porque o valor vem de iteração em runtime e o Panda não o
 * extrai em build. Só a galeria de dev faz isso.
 */
export function Layout(): ReactNode {
  return (
    <Section
      title="Espaço e forma"
      description="Escala de 4px, dois raios (controle e cartão) e os tamanhos fixos. Borda de 1px no lugar de sombra."
    >
      <S.Group>
        <S.GroupTitle>Espaço</S.GroupTitle>
        {Object.entries(tokens.spacing).map(([name, { value }]) => (
          <S.Row key={name}>
            <S.SpaceBar style={{ width: value === '0' ? '1px' : value }} />
            <S.Detail>
              {name} · {value}
            </S.Detail>
          </S.Row>
        ))}
      </S.Group>

      <S.Group>
        <S.GroupTitle>Raios</S.GroupTitle>
        {Object.entries(tokens.radii).map(([name, { value }]) => (
          <S.Row key={name}>
            <S.RadiusBox style={{ borderRadius: value }} />
            <S.Detail>
              {name} · {value}
            </S.Detail>
          </S.Row>
        ))}
      </S.Group>

      <S.Group>
        <S.GroupTitle>Tamanhos</S.GroupTitle>
        {Object.entries(tokens.sizes).map(([name, { value }]) => (
          <S.Row key={name}>
            <S.SizeBar style={{ width: value }} />
            <S.Detail>
              {name} · {value}
            </S.Detail>
          </S.Row>
        ))}
      </S.Group>
    </Section>
  )
}
