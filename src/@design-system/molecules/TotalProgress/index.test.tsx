// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TotalProgress } from './index'

describe('TotalProgress', () => {
  it('mostra o que falta, a barra e a linha de meta', () => {
    render(<TotalProgress doneHours={73} missingHours={47} goalHours={120} />)

    expect(screen.getByText('47h')).toBeInTheDocument()
    expect(screen.getByText('Faltam para completar suas horas')).toBeInTheDocument()
    expect(screen.getByText('73h feitas')).toBeInTheDocument()
    expect(screen.getByText('meta de 120h')).toBeInTheDocument()

    const bar = screen.getByRole('progressbar')

    expect(bar).toHaveAttribute('aria-valuenow', '73')
    expect(bar).toHaveAttribute('aria-valuemax', '120')
  })

  it('mostra o que falta como chega em missingHours, sem subtrair da meta', () => {
    // Valores incoerentes de propósito: se o componente subtraísse, mostraria 47h.
    render(<TotalProgress doneHours={73} missingHours={50} goalHours={120} />)

    expect(screen.getByText('50h')).toBeInTheDocument()
    expect(screen.queryByText('47h')).not.toBeInTheDocument()
  })

  it('completo não tem barra e leva ao guia quando há guideHref', () => {
    render(
      <TotalProgress
        doneHours={120}
        missingHours={0}
        goalHours={120}
        guideHref="/formulario/guia"
      />,
    )

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver como entregar seu pedido' })).toHaveAttribute(
      'href',
      '/formulario/guia',
    )
  })

  it('completo sem guideHref não mostra link', () => {
    render(<TotalProgress doneHours={120} missingHours={0} goalHours={120} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('completo com excedente avisa quanto os itens somam e que o resto não conta', () => {
    render(<TotalProgress doneHours={120} missingHours={0} goalHours={120} itemsSum={124.6} />)

    expect(
      screen.getByText('Seus itens somam 124,6h. O que passa de 120h não é aproveitado.'),
    ).toBeInTheDocument()
  })

  it('fora do estado completo, mostra doneHours e ignora itemsSum', () => {
    render(<TotalProgress doneHours={73} missingHours={47} goalHours={120} itemsSum={73.9} />)

    expect(screen.getByText('47h')).toBeInTheDocument()
    expect(screen.getByText('73h feitas')).toBeInTheDocument()
    expect(screen.queryByText(/Seus itens somam/)).not.toBeInTheDocument()
  })

  it('completo sem itemsSum não mostra a frase do excedente', () => {
    render(<TotalProgress doneHours={120} missingHours={0} goalHours={120} />)

    expect(screen.getByText('Você completou suas horas')).toBeInTheDocument()
    expect(screen.queryByText(/Seus itens somam/)).not.toBeInTheDocument()
  })

  it('completo na meta exata não mostra a frase do excedente', () => {
    render(<TotalProgress doneHours={120} missingHours={0} goalHours={120} itemsSum={120} />)

    expect(screen.queryByText(/Seus itens somam/)).not.toBeInTheDocument()
  })

  it('com 0h mostra o cartão com a barra vazia', () => {
    render(<TotalProgress doneHours={0} missingHours={120} goalHours={120} />)

    expect(screen.getByText('120h')).toBeInTheDocument()
    expect(screen.getByText('0h feitas')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('compacto põe o número ao lado do rótulo e mantém barra e meta', () => {
    render(<TotalProgress doneHours={69} missingHours={51} goalHours={120} size="compact" />)

    expect(screen.getByText('51h')).toBeInTheDocument()
    expect(screen.getByText('faltam para completar suas horas')).toBeInTheDocument()
    expect(screen.getByText('69h feitas')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '69')
  })

  it('compacto e completo diz que as horas foram cumpridas, sem barra', () => {
    render(<TotalProgress doneHours={120} missingHours={0} goalHours={120} size="compact" />)

    expect(screen.getByText('feitas, você completou suas horas')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
