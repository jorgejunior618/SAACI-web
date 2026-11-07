import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'

import { Notice } from './index'

describe('Notice', () => {
  it('na frase em linha, o tom danger vira alert e os demais viram status', () => {
    const { rerender } = render(<Notice tone="danger">Digite a data.</Notice>)

    expect(screen.getByRole('alert')).toHaveTextContent('Digite a data.')

    for (const tone of ['neutral', 'warning', 'success'] as const) {
      rerender(<Notice tone={tone}>Confira o e-mail.</Notice>)

      expect(screen.getByRole('status')).toHaveTextContent('Confira o e-mail.')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    }
  })

  it('no bloco, o role segue o tom e pode ser trocado', () => {
    const { rerender } = render(
      <Notice format="block" tone="danger" title="O envio caiu no meio">
        Nada foi registrado.
      </Notice>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('O envio caiu no meio')

    rerender(
      <Notice format="block" title="As regras do curso foram atualizadas">
        Recalculamos seu total.
      </Notice>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Recalculamos seu total.')

    rerender(
      <Notice format="block" tone="danger" role="status" title="Aviso">
        Corpo.
      </Notice>,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('o bloco mostra título, corpo e ações', () => {
    render(
      <Notice
        format="block"
        tone="danger"
        title="O envio caiu no meio"
        actions={<button type="button">Tentar de novo</button>}
      >
        Nada foi registrado.
      </Notice>,
    )

    expect(screen.getByText('O envio caiu no meio')).toBeInTheDocument()
    expect(screen.getByText('Nada foi registrado.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
  })

  it('o resumo de erros recebe foco por tabIndex e ref', () => {
    const ref = createRef<HTMLDivElement>()

    render(
      <Notice format="block" tone="danger" title="Falta corrigir 1 coisa" tabIndex={-1} ref={ref}>
        <ul>
          <li>
            <a href="#data">Digite a data em que a atividade terminou</a>
          </li>
        </ul>
      </Notice>,
    )

    ref.current?.focus()

    expect(screen.getByRole('alert')).toHaveFocus()
    expect(screen.getByRole('link', { name: /Digite a data/ })).toBeInTheDocument()
  })

  it('não repassa format ao elemento do DOM', () => {
    render(
      <Notice format="block" title="Título">
        Corpo.
      </Notice>,
    )

    expect(screen.getByRole('status')).not.toHaveAttribute('format')
  })
})
