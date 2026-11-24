// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ActivityRow } from './index'

function inList(row: ReactNode) {
  return render(<ul>{row}</ul>)
}

describe('ActivityRow', () => {
  it('counts: duração e data, sem aviso de atenção', () => {
    inList(
      <ActivityRow
        status="counts"
        title="Palestra sobre computação quântica"
        countedHours={2}
        endDate="12/03/2025"
        href="/atividades/1"
      />,
    )

    expect(screen.getByText('2,0h')).toBeInTheDocument()
    expect(screen.getByText('12/03/2025')).toBeInTheDocument()
    expect(screen.queryByText('Não conta')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/atividades/1')
  })

  it('partial: mostra "1,0h de 2,0h" e a data', () => {
    inList(
      <ActivityRow
        status="partial"
        title="Palestra de IA"
        countedHours={1}
        activityHours={2}
        endDate="20/09/2025"
        href="/x"
      />,
    )

    expect(screen.getByText('1,0h de 2,0h')).toBeInTheDocument()
    expect(screen.getByText('20/09/2025')).toBeInTheDocument()
  })

  it('doesNotCount: "Não conta" e o motivo', () => {
    inList(
      <ActivityRow
        status="doesNotCount"
        title="Palestra de boas-vindas"
        reason="antes do seu ingresso"
        href="/x"
      />,
    )

    expect(screen.getByText('Não conta')).toBeInTheDocument()
    expect(screen.getByText('antes do seu ingresso')).toBeInTheDocument()
  })

  it('sem selection não tem checkbox', () => {
    inList(<ActivityRow status="doesNotCount" title="A" reason="x" href="/x" />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('com selection a linha inteira marca e desmarca, sem link e sem seta', () => {
    const onChange = vi.fn()

    inList(
      <ActivityRow
        status="counts"
        title="Palestra X"
        countedHours={2}
        endDate="12/03/2025"
        selection={{ checked: false, onChange }}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Selecionar Palestra X' })).not.toBeChecked()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Palestra X'))
    expect(onChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByText('12/03/2025'))
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('marcado, o toque desmarca', () => {
    const onChange = vi.fn()

    inList(
      <ActivityRow
        status="doesNotCount"
        title="Palestra Y"
        reason="antes do seu ingresso"
        selection={{ checked: true, onChange }}
      />,
    )

    fireEvent.click(screen.getByText('Palestra Y'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('desabilitada, aparece no modo de seleção mas não marca nem navega', () => {
    const onChange = vi.fn()

    inList(
      <ActivityRow
        status="doesNotCount"
        title="Palestra de boas-vindas"
        reason="antes do seu ingresso"
        selection={{ checked: false, onChange, isDisabled: true }}
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: 'Selecionar Palestra de boas-vindas' }),
    ).toBeDisabled()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Palestra de boas-vindas'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('o tipo recusa href junto com selection', () => {
    inList(
      // @ts-expect-error: a linha do modo de seleção não navega.
      <ActivityRow
        status="doesNotCount"
        title="Z"
        reason="x"
        href="/x"
        selection={{ checked: false, onChange: vi.fn() }}
      />,
    )

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })
})
