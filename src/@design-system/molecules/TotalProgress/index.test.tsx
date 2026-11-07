import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TotalProgress } from './index'

describe('TotalProgress', () => {
  it('mostra o que falta, a barra e a linha de meta', () => {
    render(<TotalProgress doneHours={73} goalHours={120} />)

    expect(screen.getByText('47h')).toBeInTheDocument()
    expect(screen.getByText('Faltam para completar suas horas')).toBeInTheDocument()
    expect(screen.getByText('73h feitas')).toBeInTheDocument()
    expect(screen.getByText('meta de 120h')).toBeInTheDocument()

    const bar = screen.getByRole('progressbar')

    expect(bar).toHaveAttribute('aria-valuenow', '73')
    expect(bar).toHaveAttribute('aria-valuemax', '120')
  })

  it('arredonda as horas feitas para baixo', () => {
    render(<TotalProgress doneHours={73.9} goalHours={120} />)

    expect(screen.getByText('47h')).toBeInTheDocument()
    expect(screen.getByText('73h feitas')).toBeInTheDocument()
  })

  it('para na meta: horas acima dela viram o estado completo, sem número negativo', () => {
    render(<TotalProgress doneHours={150} goalHours={120} />)

    expect(screen.getByText('120h')).toBeInTheDocument()
    expect(screen.getByText('Você completou suas horas')).toBeInTheDocument()
    expect(screen.queryByText(/-/)).not.toBeInTheDocument()
  })

  it('completo não tem barra e leva ao guia quando há guideHref', () => {
    render(<TotalProgress doneHours={120} goalHours={120} guideHref="/formulario/guia" />)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver como entregar seu pedido' })).toHaveAttribute(
      'href',
      '/formulario/guia',
    )
  })

  it('completo sem guideHref não mostra link', () => {
    render(<TotalProgress doneHours={120} goalHours={120} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('119,9h ainda não está completo', () => {
    render(<TotalProgress doneHours={119.9} goalHours={120} />)

    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('completo com excedente avisa quanto os itens somam e que o resto não conta', () => {
    render(<TotalProgress doneHours={124.6} goalHours={120} />)

    expect(
      screen.getByText('Seus itens somam 124h. O que passa de 120h não é aproveitado.'),
    ).toBeInTheDocument()
  })

  it('completo na meta exata não mostra a frase do excedente', () => {
    render(<TotalProgress doneHours={120} goalHours={120} />)

    expect(screen.queryByText(/Seus itens somam/)).not.toBeInTheDocument()
  })

  it('com 0h mostra o cartão com a barra vazia', () => {
    render(<TotalProgress doneHours={0} goalHours={120} />)

    expect(screen.getByText('120h')).toBeInTheDocument()
    expect(screen.getByText('0h feitas')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })
})
