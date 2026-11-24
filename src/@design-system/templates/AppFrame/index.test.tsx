// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppFrame } from './index'

describe('AppFrame', () => {
  it('mostra o conteúdo dentro do main', () => {
    render(<AppFrame>Conteúdo da tela</AppFrame>)

    expect(screen.getByRole('main')).toHaveTextContent('Conteúdo da tela')
  })

  it('renderiza a barra de topo e a inferior quando recebidas', () => {
    render(
      <AppFrame topBar={<header>Topo</header>} bottomNav={<nav aria-label="Principal">Base</nav>}>
        Conteúdo
      </AppFrame>,
    )

    expect(screen.getByRole('banner')).toHaveTextContent('Topo')
    expect(screen.getByRole('navigation', { name: 'Principal' })).toHaveTextContent('Base')
  })

  it('sem as barras só existe o main', () => {
    render(<AppFrame>Conteúdo</AppFrame>)

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
