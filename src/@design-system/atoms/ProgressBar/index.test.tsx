// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressBar } from './index'

function fillOf(bar: HTMLElement): HTMLElement {
  const fill = bar.firstElementChild

  if (!(fill instanceof HTMLElement)) throw new Error('A barra não tem preenchimento.')

  return fill
}

describe('ProgressBar', () => {
  it('expõe o valor, o mínimo, o máximo e o rótulo como progressbar', () => {
    render(<ProgressBar value={5} max={20} label="Horas de Ensino" />)

    const bar = screen.getByRole('progressbar', { name: 'Horas de Ensino' })

    expect(bar).toHaveAttribute('aria-valuenow', '5')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '20')
    expect(fillOf(bar)).toHaveStyle({ width: '25%' })
  })

  it('não passa de max quando value é maior', () => {
    render(<ProgressBar value={30} max={20} label="Horas de Pesquisa" />)

    const bar = screen.getByRole('progressbar')

    expect(bar).toHaveAttribute('aria-valuenow', '20')
    expect(fillOf(bar)).toHaveStyle({ width: '100%' })
  })

  it('não vai abaixo de zero quando value é negativo', () => {
    render(<ProgressBar value={-3} max={20} label="Horas de Extensão" />)

    const bar = screen.getByRole('progressbar')

    expect(bar).toHaveAttribute('aria-valuenow', '0')
    expect(fillOf(bar)).toHaveStyle({ width: '0%' })
  })

  it('aceita size sem mudar o que a barra expõe', () => {
    render(<ProgressBar value={5} max={20} label="Total" size="md" />)

    const bar = screen.getByRole('progressbar', { name: 'Total' })

    expect(bar).toHaveAttribute('aria-valuenow', '5')
    expect(fillOf(bar)).toHaveStyle({ width: '25%' })
  })
})
