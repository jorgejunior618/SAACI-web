import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CategoryCard } from './index'

describe('CategoryCard', () => {
  it('mostra item, nome, horas, máximo e quanto ainda cabe', () => {
    render(
      <CategoryCard
        itemNumber={7}
        name="Curso na área de engenharia"
        countedHours={18}
        maxHours={60}
        href="/certificados?item=7"
      />,
    )

    expect(screen.getByText('Item 7')).toBeInTheDocument()
    expect(screen.getByText('18,0h')).toBeInTheDocument()
    expect(screen.getByText('de 60h')).toBeInTheDocument()
    expect(screen.getByText('Ainda cabem 42,0h')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/certificados?item=7')
  })

  it('completo troca o rodapé e diz quanto não conta', () => {
    render(
      <CategoryCard
        itemNumber={13}
        name="Palestras como ouvinte"
        countedHours={30}
        maxHours={30}
        overflowHours={4}
        href="/x"
      />,
    )

    expect(screen.getByText('Completo. 4,0h registradas não contam')).toBeInTheDocument()
    expect(screen.queryByText(/Ainda cabem/)).not.toBeInTheDocument()
  })

  it('completo sem excedente só diz "Completo"', () => {
    render(
      <CategoryCard itemNumber={13} name="Palestras" countedHours={30} maxHours={30} href="/x" />,
    )

    expect(screen.getByText('Completo')).toBeInTheDocument()
  })
})
