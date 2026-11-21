import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContaApagada } from './index'

describe('ContaApagada', () => {
  it('confirma a exclusão, diz o prazo de 7 dias e não promete e-mail', () => {
    render(<ContaApagada />)

    expect(screen.getByText('Sua conta foi apagada')).toBeInTheDocument()
    expect(screen.getByText(/em até 7 dias/)).toBeInTheDocument()
    expect(screen.queryByText(/e-mail/)).not.toBeInTheDocument()
  })

  it('leva a Entrar em "Voltar ao início"', () => {
    render(<ContaApagada />)

    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute(
      'href',
      '/entrar',
    )
  })
})
