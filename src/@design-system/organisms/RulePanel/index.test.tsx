// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RulePanel } from './index'

const base = {
  itemNumber: 13,
  itemName: 'Palestra como ouvinte',
  rule: 'Cada palestra conta 2h, não importa quantas horas ela durou.',
  usedHours: 26,
  maxHours: 30,
  calcRows: [
    { label: '3 palestras × 2h', value: 6 },
    { label: 'Cabem neste item', value: 4 },
  ],
  willCount: 4,
}

describe('RulePanel', () => {
  it('nomeia a região pelo título e mostra a regra na tela', () => {
    render(<RulePanel {...base} />)

    expect(
      screen.getByRole('region', { name: 'Item 13 · Palestra como ouvinte' }),
    ).toBeInTheDocument()
    expect(screen.getByText(base.rule)).toBeInTheDocument()
  })

  it('diz quanto ainda cabe e quanto já foi usado', () => {
    render(<RulePanel {...base} />)

    // O mesmo valor também aparece na tabela, então a busca fica restrita ao destaque.
    expect(screen.getByText('4,0h', { selector: 'b' })).toBeInTheDocument()
    expect(screen.getByText('26h de 30h')).toBeInTheDocument()

    const bar = screen.getByRole('progressbar')

    expect(bar).toHaveAttribute('aria-valuenow', '26')
    expect(bar).toHaveAttribute('aria-valuemax', '30')
  })

  it('nunca mostra "Ainda cabem" negativo com o item acima do máximo', () => {
    render(<RulePanel {...base} usedHours={34} />)

    expect(screen.getByText('0,0h')).toBeInTheDocument()
    expect(screen.queryByText(/-/)).not.toBeInTheDocument()
  })

  it('mantém a parte decimal das horas usadas', () => {
    render(<RulePanel {...base} usedHours={26.5} />)

    expect(screen.getByText('26,5h de 30h')).toBeInTheDocument()
  })

  it('anuncia a tabela do cálculo com aria-live polite', () => {
    render(<RulePanel {...base} />)

    expect(screen.getByRole('table', { name: 'Quanto essa atividade vai contar' })).toHaveAttribute(
      'aria-live',
      'polite',
    )
  })

  it('escreve as linhas na ordem recebida e termina em "Vai contar"', () => {
    render(<RulePanel {...base} />)

    const rows = screen.getAllByRole('row')

    expect(rows.map((row) => row.textContent)).toEqual([
      '3 palestras × 2h6,0h',
      'Cabem neste item4,0h',
      'Vai contar4,0h',
    ])

    const last = rows[rows.length - 1]

    expect(within(last).getByRole('rowheader', { name: 'Vai contar' })).toBeInTheDocument()
    expect(last.closest('tfoot')).not.toBeNull()
  })

  it('sem linhas de cálculo, mostra só "Vai contar"', () => {
    render(<RulePanel {...base} calcRows={[]} willCount={0} />)

    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(screen.getByText('0,0h', { selector: 'td' })).toBeInTheDocument()
  })

  it('mostra o aviso só quando ele existe', () => {
    const { rerender } = render(<RulePanel {...base} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <RulePanel
        {...base}
        warning="Essa atividade vale 6,0h, mas só cabem mais 4,0h neste item."
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Essa atividade vale 6,0h, mas só cabem mais 4,0h neste item.',
    )
  })
})
