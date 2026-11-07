import type { ReactNode } from 'react'

import { BottomNav } from '@design-system'

import { Section } from '../Section'
import { Specimen } from '../Specimen'
import { Demo } from './_components/Demo'
import { action, items } from './items'
import * as S from './styles'

/** Página "BottomNav" da galeria: a aba ativa em dois casos e a área de teste. */
export function BottomNavSection(): ReactNode {
  return (
    <Section
      title="BottomNav"
      description="Barra inferior com quatro abas e a ação Registrar no centro, sempre com ícone e rótulo. A aba ativa muda de cor, de peso e de traço, sem pílula de fundo. Registrar é um círculo que sobe acima da barra, abre um fluxo e nunca fica ativo. Em tela larga a barra continua embaixo."
    >
      <S.Specimens>
        <Specimen label='activeId="inicio"'>
          <S.Frame>
            <BottomNav items={items} action={action} activeId="inicio" />
          </S.Frame>
        </Specimen>
        <Specimen label='activeId="perfil"'>
          <S.Frame>
            <BottomNav items={items} action={action} activeId="perfil" />
          </S.Frame>
        </Specimen>
      </S.Specimens>
      <Demo />
    </Section>
  )
}
