// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SubmitBar } from './index'

describe('SubmitBar', () => {
  it('mostra o rótulo e as horas formatadas, e o botão envia o formulário pelo id', () => {
    render(
      <SubmitBar formId="registro" summaryLabel="Vai contar" willCount={10} busyLabel="Registrando">
        Registrar
      </SubmitBar>,
    )

    expect(screen.getByText('Vai contar')).toBeInTheDocument()
    expect(screen.getByText('10,0h')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar' })).toHaveAttribute('form', 'registro')
    expect(screen.getByRole('button', { name: 'Registrar' })).toHaveAttribute('type', 'submit')
  })

  it('esconde a linha de horas enquanto não há número', () => {
    render(
      <SubmitBar formId="f" summaryLabel="Vai contar" willCount={null} busyLabel="Salvando">
        Salvar correção
      </SubmitBar>,
    )

    expect(screen.queryByText('Vai contar')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar correção' })).toBeInTheDocument()
  })

  it('mostra o gerúndio e não envia de novo enquanto grava', () => {
    render(
      <SubmitBar formId="f" summaryLabel="Vai contar" willCount={4} busy busyLabel="Salvando">
        Salvar correção
      </SubmitBar>,
    )

    const button = screen.getByRole('button', { name: /Salvando/ })

    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('type', 'button')
  })
})
