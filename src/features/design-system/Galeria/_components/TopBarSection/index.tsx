import type { ReactNode } from 'react'

import { Section } from '../Section'
import { Examples } from './_components/Examples'

/** Página "TopBar" da galeria: as três variantes, o título longo e a borda ao rolar. */
export function TopBarSection(): ReactNode {
  return (
    <Section
      title="TopBar"
      description="Barra de 56px no creme do fundo, sem borda parada e sem sombra. No Início mostra só o símbolo e o nome; nas abas, o título da tela; nas telas internas, Voltar e o título. A borda aparece só quando o conteúdo rola por baixo."
    >
      <Examples />
    </Section>
  )
}
