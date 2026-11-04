import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '.'

describe('Button', () => {
  it('continua visível e desabilitado enquanto envia', () => {
    render(<Button isLoading>Registrando</Button>)

    const botao = screen.getByRole('button', { name: 'Registrando' })
    expect(botao).toBeDisabled()
    expect(botao).toHaveAttribute('aria-busy', 'true')
  })

  it('não envia formulário por padrão', () => {
    render(<Button>Cancelar</Button>)

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button')
  })
})
