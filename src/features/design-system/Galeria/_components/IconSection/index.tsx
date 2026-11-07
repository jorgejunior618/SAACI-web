import { Camera } from 'lucide-react'
import type { ReactNode } from 'react'

import { Icon } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "Icon" da galeria: os três tamanhos e uma área de teste das props. */
export function IconSection(): ReactNode {
  return (
    <Section
      title="Icon"
      description="Invólucro do Lucide com traço de 1,5px e a cor do texto ao redor. Fica escondido de leitor de tela e nunca aparece sem texto. Sem emoji."
    >
      <S.Specimens>
        <Specimen label='size="sm" · 16px, dentro de linha'>
          <S.Line>
            <Icon icon={Camera} size="sm" />
            Tirar foto
          </S.Line>
        </Specimen>
        <Specimen label='size="md" · 20px, em botão'>
          <S.Line>
            <Icon icon={Camera} size="md" />
            Tirar foto
          </S.Line>
        </Specimen>
        <Specimen label='size="lg" · 22px, na barra inferior'>
          <S.Line>
            <Icon icon={Camera} size="lg" />
            Tirar foto
          </S.Line>
        </Specimen>
        <Specimen label='size="xl" · 28px, dentro do círculo da tela de estado'>
          <S.Line>
            <Icon icon={Camera} size="xl" />
            Tirar foto
          </S.Line>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
