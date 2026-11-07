import type { ReactNode } from 'react'

import { BottomNav } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import { items } from './items'
import * as S from './styles'

/** Página "BottomNav" da galeria: o destino ativo em dois casos e a área de teste. */
export function BottomNavSection(): ReactNode {
  return (
    <Section
      title="BottomNav"
      description="Barra inferior com quatro destinos, sempre com ícone e rótulo. O ativo muda de cor, de peso e de traço, sem pílula de fundo. Não há quinto destino nem botão flutuante, e em tela larga ela continua embaixo."
    >
      <S.Specimens>
        <Specimen label='activeId="inicio"'>
          <S.Frame>
            <BottomNav items={items} activeId="inicio" />
          </S.Frame>
        </Specimen>
        <Specimen label='activeId="certificados"'>
          <S.Frame>
            <BottomNav items={items} activeId="certificados" />
          </S.Frame>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
