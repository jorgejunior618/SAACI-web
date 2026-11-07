import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Disclosure } from './index'

function renderDisclosure(defaultOpen?: boolean) {
  return render(
    <Disclosure title="Outras atividades que contam" count={2} defaultOpen={defaultOpen}>
      <Disclosure.Row itemNumber={1} name="Iniciação científica" rule="40h por período, até 80h" />
      <Disclosure.Row itemNumber={3} name="Monitoria" />
    </Disclosure>,
  )
}

describe('Disclosure', () => {
  it('mostra título, contador e as linhas com número, nome e regra', () => {
    renderDisclosure()

    expect(screen.getByText('Outras atividades que contam')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Iniciação científica')).toBeInTheDocument()
    expect(screen.getByText('40h por período, até 80h')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('começa fechada e abre e fecha ao clicar no cabeçalho', () => {
    const { container } = renderDisclosure()
    const details = container.querySelector('details')
    const summary = container.querySelector('summary')

    if (!details || !summary) throw new Error('Faltam details ou summary.')

    expect(details).not.toHaveAttribute('open')

    fireEvent.click(summary)
    expect(details).toHaveAttribute('open')

    fireEvent.click(summary)
    expect(details).not.toHaveAttribute('open')
  })

  it('com defaultOpen começa aberta', () => {
    const { container } = renderDisclosure(true)

    expect(container.querySelector('details')).toHaveAttribute('open')
  })
})
