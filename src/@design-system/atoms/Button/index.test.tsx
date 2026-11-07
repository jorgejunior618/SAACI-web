import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './index'

describe('Button', () => {
  it('dispara o clique e não envia formulário por padrão', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Registrar</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('com busy marca aria-busy, mostra o gerúndio e anuncia o status', () => {
    render(
      <Button busy busyLabel="Registrando">
        Registrar
      </Button>,
    )

    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveTextContent('Registrando')
    // O texto original sai de cena enquanto envia.
    expect(screen.queryByText('Registrar')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Registrando')
  })

  it('com busy ignora o clique, sem usar disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button busy onClick={onClick}>
        Registrar
      </Button>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeEnabled()
  })

  it('sem busy não tem aria-busy', () => {
    render(<Button>Registrar</Button>)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
  })
})
