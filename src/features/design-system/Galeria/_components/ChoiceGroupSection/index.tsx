import type { ReactNode } from 'react'

import { Section } from '../Section'
import { Demo } from './_components/Demo'
import { Examples } from './_components/Examples'
import * as S from './styles'

/** Página "ChoiceGroup" da galeria: o radio em lista, o checkbox isolado e a área de teste. */
export function ChoiceGroupSection(): ReactNode {
  return (
    <Section
      title="ChoiceGroup"
      description="Escolha entre poucas opções, numa lista única com o efeito de cada uma escrito embaixo. Nada vem marcado de início. Mais de 5 opções, ou opções com número e regra, pedem o ItemPicker."
    >
      <S.Specimens>
        <Examples />
      </S.Specimens>
      <Demo />
    </Section>
  )
}
