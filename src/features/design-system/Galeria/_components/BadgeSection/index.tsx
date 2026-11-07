import type { ReactNode } from 'react'

import { Badge } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "Badge" da galeria: os quatro tons e a área de teste. */
export function BadgeSection(): ReactNode {
  return (
    <Section
      title="Badge"
      description="Etiqueta curta de estado. O fundo é sempre o mesmo neutro e só a cor do texto muda. Sem ícone, sem ação e sem quinto tom."
    >
      <S.Specimens>
        <Specimen label='tone="neutral"'>
          <Badge tone="neutral">Opcional</Badge>
        </Specimen>
        <Specimen label='tone="counts"'>
          <Badge tone="counts">Conta</Badge>
        </Specimen>
        <Specimen label='tone="partial"'>
          <Badge tone="partial">Conta em parte</Badge>
        </Specimen>
        <Specimen label='tone="doesNotCount"'>
          <Badge tone="doesNotCount">Não conta</Badge>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
