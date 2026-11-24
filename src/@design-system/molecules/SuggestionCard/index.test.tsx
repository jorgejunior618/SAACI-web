// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SuggestionCard } from './index'

const item = {
  number: 7,
  name: 'Curso na área de engenharia de computação',
  rule: '1h para cada 4h de curso, até 60h',
}

describe('SuggestionCard', () => {
  it('lendo, mostra só a linha de status com o tempo esperado, sem botões', () => {
    render(<SuggestionCard status="reading" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Lendo seu certificado, cerca de 20 segundos',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('lendo, anuncia a frase uma vez só', () => {
    render(<SuggestionCard status="reading" readingMessage="Lendo seu certificado, quase pronto" />)

    // getAllByText não ignora aria-hidden: conta só as cópias que o leitor de tela alcança.
    const lidas = screen
      .getAllByText('Lendo seu certificado, quase pronto')
      .filter((element) => !element.closest('[aria-hidden="true"]'))

    expect(lidas).toHaveLength(1)
  })

  it('sugerido, nomeia o cartão pela pergunta e mostra o item com a regra', () => {
    render(
      <SuggestionCard status="suggested" item={item} onConfirm={vi.fn()} onChooseOther={vi.fn()} />,
    )

    expect(
      screen.getByRole('region', { name: 'Parece ser este item. É esse mesmo?' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Item 7')).toBeInTheDocument()
    expect(screen.getByText(item.name)).toBeInTheDocument()
    expect(screen.getByText(item.rule)).toBeInTheDocument()
  })

  it('não marca nada: a sugestão só vale quando o aluno confirma', () => {
    render(
      <SuggestionCard status="suggested" item={item} onConfirm={vi.fn()} onChooseOther={vi.fn()} />,
    )

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { selected: true })).not.toBeInTheDocument()
  })

  it('"É esse" chama onConfirm e só ele', async () => {
    const onConfirm = vi.fn()
    const onChooseOther = vi.fn()

    render(
      <SuggestionCard
        status="suggested"
        item={item}
        onConfirm={onConfirm}
        onChooseOther={onChooseOther}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'É esse' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onChooseOther).not.toHaveBeenCalled()
  })

  it('"Escolher outro" chama onChooseOther e só ele', async () => {
    const onConfirm = vi.fn()
    const onChooseOther = vi.fn()

    render(
      <SuggestionCard
        status="suggested"
        item={item}
        onConfirm={onConfirm}
        onChooseOther={onChooseOther}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Escolher outro' }))

    expect(onChooseOther).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
