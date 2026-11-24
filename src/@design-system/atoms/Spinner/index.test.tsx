// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Spinner } from './index'

describe('Spinner', () => {
  it('anuncia o carregamento como status, com texto para leitor de tela', () => {
    render(<Spinner />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('usa o rótulo informado', () => {
    render(<Spinner label="Enviando certificado" />)

    expect(screen.getByRole('status')).toHaveTextContent('Enviando certificado')
  })
})
