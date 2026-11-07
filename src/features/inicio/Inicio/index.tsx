import type { ReactNode } from 'react'

import { Content } from './styles'

/** Página inicial provisória, até a primeira tela ser especificada. */
export function Inicio(): ReactNode {
  return (
    <Content>
      <h1>SAACI</h1>
      <p>Sistema de Apoio Acadêmico Colaborativo do IFCE.</p>
    </Content>
  )
}
