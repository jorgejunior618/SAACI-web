import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContaApagada } from './index'

describe('ContaApagada', () => {
  it('confirma a exclusão e mostra os marcadores do prazo e do e-mail, que ainda não existem', () => {
    render(<ContaApagada />)

    expect(screen.getByText('Sua conta foi apagada')).toBeInTheDocument()
    expect(screen.getByText(/\[PRAZO DO RNF05\]/)).toBeInTheDocument()
    expect(screen.getByText(/\[E-MAIL DE CONFIRMAÇÃO DA EXCLUSÃO\]/)).toBeInTheDocument()
  })

  it('leva a Entrar em "Voltar ao início"', () => {
    render(<ContaApagada />)

    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute(
      'href',
      '/entrar',
    )
  })
})
