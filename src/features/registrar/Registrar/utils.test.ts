// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import { suggestionToForm } from './utils'

describe('suggestionToForm', () => {
  it('preenche o que foi lido e deixa em branco o que não foi', () => {
    expect(
      suggestionToForm({
        itemNumber: 7,
        name: 'Curso de React',
        quantity: 2.5,
        startDate: '2026-08-03',
        endDate: null,
      }),
    ).toEqual({ name: 'Curso de React', quantity: '2,5', startDate: '03/08/2026', endDate: '' })
  })
})
