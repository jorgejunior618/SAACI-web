import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ThemeToggle } from '.'

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.dataset.theme = 'light'
  })

  it('liga o modo escuro e guarda a escolha', () => {
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('saaci:tema')).toBe('escuro')
    expect(screen.getByRole('button', { name: 'Desativar modo escuro' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('desliga e volta para o claro', () => {
    document.documentElement.dataset.theme = 'dark'
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Desativar modo escuro' }))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('saaci:tema')).toBe('claro')
  })
})
