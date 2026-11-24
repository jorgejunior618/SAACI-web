// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { ItemPicker } from './index'

const items = [
  { number: 6, name: 'Curso de línguas', rule: '1h para cada 4h de curso, até 60h' },
  {
    number: 7,
    name: 'Curso na área de engenharia de computação',
    rule: '1h para cada 4h, até 60h',
  },
  { number: 13, name: 'Palestra como ouvinte', rule: 'Cada palestra conta 2h, até 30h' },
]

const LABEL = 'Em qual item do formulário essa atividade entra?'

// O jsdom não implementa a rolagem; o componente só a usa para manter o item do teclado à vista.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

function Controlled({
  onChange = vi.fn(),
  initialValue = null,
}: {
  onChange?: (number: number) => void
  initialValue?: number | null
}): ReactNode {
  const [query, setQuery] = useState('')
  const [value, setValue] = useState<number | null>(initialValue)

  return (
    <ItemPicker
      label={LABEL}
      items={items}
      value={value}
      onChange={(number) => {
        setValue(number)
        onChange(number)
      }}
      query={query}
      onQueryChange={setQuery}
      suggestions={['evento', 'curso']}
    />
  )
}

describe('ItemPicker', () => {
  it('abre fechado: só o campo, sem lista e sem nada marcado', () => {
    render(<Controlled />)

    const field = screen.getByRole('combobox', { name: LABEL })

    expect(field).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('tocar no campo abre a lista com todos os itens na ordem, nenhum marcado', async () => {
    render(<Controlled />)

    await userEvent.click(screen.getByRole('combobox'))

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox', { name: 'Itens do formulário' })).toBeInTheDocument()

    const options = screen.getAllByRole('option')

    expect(options.map((option) => option.textContent)).toEqual([
      '6Curso de línguas1h para cada 4h de curso, até 60h',
      '7Curso na área de engenharia de computação1h para cada 4h, até 60h',
      '13Palestra como ouvinteCada palestra conta 2h, até 30h',
    ])

    for (const option of options) {
      expect(option).toHaveAttribute('aria-selected', 'false')
    }
  })

  it('a lista é um painel flutuante: fica fora do fluxo, sem empurrar o que vem depois', async () => {
    render(<Controlled />)

    await userEvent.click(screen.getByRole('combobox'))

    // Posicionada de forma absoluta dentro da âncora do componente, não no fluxo da página.
    expect(screen.getByRole('listbox').className).toContain('pos_absolute')
  })

  it('tocar numa linha escolhe o item, fecha a lista e mostra a escolha no campo', async () => {
    const onChange = vi.fn()

    render(<Controlled onChange={onChange} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Palestra como ouvinte'))

    expect(onChange).toHaveBeenCalledWith(13)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('13 · Palestra como ouvinte')
  })

  it('reabrir com um item escolhido mostra todos e marca só o escolhido', async () => {
    render(<Controlled initialValue={7} />)

    expect(screen.getByRole('combobox')).toHaveValue(
      '7 · Curso na área de engenharia de computação',
    )

    await userEvent.click(screen.getByRole('combobox'))

    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: /engenharia de computação/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('option', { name: /Curso de línguas/ })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('digitar filtra pelo nome e pela regra, sem acento', async () => {
    render(<Controlled />)

    await userEvent.type(screen.getByRole('combobox'), 'LINGUAS')

    expect(screen.getAllByRole('option')).toHaveLength(1)

    await userEvent.clear(screen.getByRole('combobox'))
    // "2h" só existe na regra da palestra.
    await userEvent.type(screen.getByRole('combobox'), '2h')

    expect(screen.getByRole('option', { name: /Palestra como ouvinte/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Curso de línguas/ })).not.toBeInTheDocument()
  })

  it('avisa a tela do que foi digitado', async () => {
    const onQueryChange = vi.fn()

    render(
      <ItemPicker
        label={LABEL}
        items={items}
        value={null}
        onChange={vi.fn()}
        query=""
        onQueryChange={onQueryChange}
      />,
    )

    await userEvent.type(screen.getByRole('combobox'), 'p')

    expect(onQueryChange).toHaveBeenCalledWith('p')
  })

  it('setas movem o item destacado e Enter escolhe', async () => {
    const onChange = vi.fn()

    render(<Controlled onChange={onChange} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: /engenharia de computação/ }).id,
    )

    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(7)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Enter sem item destacado não escolhe nada', async () => {
    const onChange = vi.fn()

    render(<Controlled onChange={onChange} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.keyboard('{Enter}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('Esc fecha a lista sem escolher', async () => {
    render(<Controlled />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('sair do campo fecha a lista', async () => {
    render(<Controlled />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.tab()

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('sem resultado, some a lista e diz o que tentar', async () => {
    render(<Controlled />)

    await userEvent.type(screen.getByRole('combobox'), 'hackathon')

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      "Nenhum item tem 'hackathon'. Tente 'evento' ou 'curso'.",
    )
  })

  it('a região de status existe vazia quando há resultado', () => {
    render(<Controlled />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
