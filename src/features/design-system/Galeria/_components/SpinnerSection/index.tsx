import type { ReactNode } from 'react'

import { Spinner } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "Spinner" da galeria: os dois tamanhos, o `sm` dentro de botão e a área de teste. */
export function SpinnerSection(): ReactNode {
  return (
    <Section
      title="Spinner"
      description="Indicador de carregamento com role status e um texto para leitor de tela. O pequeno herda a cor do texto; o grande é só para tela inteira."
    >
      <S.Specimens>
        <Specimen label='size="sm" · herda a cor do texto'>
          <Spinner size="sm" />
        </Specimen>
        <Specimen label='size="lg" · redemoinho com ponta brand'>
          <Spinner size="lg" />
        </Specimen>
        <Specimen label="sm sobre brand, como no botão primário">
          <S.OnBrand>
            <Spinner size="sm" label="Enviando" />
            Enviando
          </S.OnBrand>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
