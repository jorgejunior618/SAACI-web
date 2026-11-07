import { Camera } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import * as S from './styles'

/** Página "Button" da galeria: os quatro papéis, os estados e a área de teste. */
export function ButtonSection(): ReactNode {
  return (
    <Section
      title="Button"
      description="Dispara uma ação, com 48px de altura. O primário leva ao próximo passo e aparece uma vez por tela. Disabled só para ação impossível; campo vazio não desabilita."
    >
      <S.Specimens>
        <Specimen label='variant="primary" · uma por tela'>
          <Button variant="primary">Registrar</Button>
        </Specimen>
        <Specimen label='variant="secondary" · ação paralela'>
          <Button variant="secondary">Escolher arquivo</Button>
        </Specimen>
        <Specimen label='variant="tertiary" · saída lateral'>
          <Button variant="tertiary">Reenviar link</Button>
        </Specimen>
        <Specimen label='variant="danger" · só em confirmação'>
          <Button variant="danger">Excluir atividade</Button>
        </Specimen>
        <Specimen label="icon · só quando ajuda a reconhecer">
          <Button variant="secondary" icon={Camera}>
            Tirar foto
          </Button>
        </Specimen>
        <Specimen label='as="a" · botão que navega'>
          <Button as="a" href="#guia">
            Ver como entregar seu pedido
          </Button>
        </Specimen>
        <Specimen label="busy · gerúndio, sem clique">
          <Button busy busyLabel="Registrando">
            Registrar
          </Button>
        </Specimen>
        <Specimen label="disabled · ação impossível">
          <Button disabled>Registrar</Button>
        </Specimen>
        <Specimen label="block · rodapé de formulário">
          <S.Wide>
            <Button block>Registrar atividade</Button>
          </S.Wide>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
