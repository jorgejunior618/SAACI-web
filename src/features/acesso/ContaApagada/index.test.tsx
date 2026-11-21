import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContaApagada } from './index'

describe('ContaApagada', () => {
  it('confirma a exclusão, diz o prazo de 7 dias e mostra o marcador do e-mail, que ainda não existe', () => {
    render(<ContaApagada />)

    expect(screen.getByText('Sua conta foi apagada')).toBeInTheDocument()
    expect(screen.getByText(/em até 7 dias/)).toBeInTheDocument()
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
