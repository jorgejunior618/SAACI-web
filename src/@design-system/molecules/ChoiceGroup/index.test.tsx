import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ChoiceGroup } from './index'

const options = [
  { value: 'primeiro', label: '1º autor', effect: 'Conta a carga completa' },
  { value: 'segundo', label: '2º autor', effect: 'Conta metade' },
  { value: 'outro', label: 'Outro', effect: 'Conta 1/3' },
]

describe('ChoiceGroup', () => {
  it('nomeia o grupo pela pergunta e começa sem nada marcado', () => {
    render(
      <ChoiceGroup
        legend="Você é qual autor do artigo?"
        name="autoria"
        options={options}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('group', { name: 'Você é qual autor do artigo?' })).toBeInTheDocument()

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked()
    }
  })

  it('mostra o efeito de cada opção e o inclui no nome acessível', () => {
    render(<ChoiceGroup legend="Autor" name="autoria" options={options} onChange={vi.fn()} />)

    expect(screen.getByRole('radio', { name: /2º autor.*Conta metade/ })).toBeInTheDocument()
  })

  it('marca só a opção do value', () => {
    render(
      <ChoiceGroup
        legend="Autor"
        name="autoria"
        options={options}
        value="segundo"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: /2º autor/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /1º autor/ })).not.toBeChecked()
  })

  it('escolhe pelo teclado: espaço marca a opção em foco', async () => {
    const onChange = vi.fn()
    render(<ChoiceGroup legend="Autor" name="autoria" options={options} onChange={onChange} />)

    act(() => screen.getByRole('radio', { name: /1º autor/ }).focus())
    await userEvent.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith('primeiro')
  })

  it('escolhe pelo teclado: seta para baixo vai para a próxima opção', async () => {
    const onChange = vi.fn()
    render(<ChoiceGroup legend="Autor" name="autoria" options={options} onChange={onChange} />)

    act(() => screen.getByRole('radio', { name: /1º autor/ }).focus())
    await userEvent.keyboard('{ArrowDown}')

    expect(onChange).toHaveBeenCalledWith('segundo')
  })

  it('com erro, liga a mensagem ao grupo', () => {
    render(
      <ChoiceGroup
        legend="Autor"
        name="autoria"
        options={options}
        error="Escolha uma opção para continuar."
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('group', { name: 'Autor' })).toHaveAccessibleDescription(
      'Escolha uma opção para continuar.',
    )
  })

  it('checkbox isolado começa desmarcado e devolve o novo estado', async () => {
    const onChange = vi.fn()
    render(
      <ChoiceGroup
        variant="single"
        label="Baixar também os certificados que não contam"
        checked={false}
        onChange={onChange}
      />,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: 'Baixar também os certificados que não contam',
    })

    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledWith(true)
  })
})
