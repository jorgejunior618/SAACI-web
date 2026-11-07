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

  it('com selection o checkbox leva o nome da atividade, fica fora do link e avisa a mudança', () => {
    const onChange = vi.fn()

    inList(
      <ActivityRow
        status="counts"
        title="Palestra X"
        countedHours={2}
        endDate="12/03/2025"
        href="/x"
        selection={{ checked: false, onChange }}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Selecionar Palestra X' })

    expect(screen.getByRole('link')).not.toContainElement(checkbox)

    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
