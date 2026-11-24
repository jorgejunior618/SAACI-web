// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import { getInitials } from './utils'

const EMAIL = 'ana.moura07@aluno.ifce.edu.br'

describe('getInitials', () => {
  it('usa a primeira letra do primeiro e do último nome', () => {
    expect(getInitials('Ana Beatriz Moura', EMAIL)).toBe('AM')
  })

  it('usa uma letra só quando o nome tem uma palavra', () => {
    expect(getInitials('Ana', EMAIL)).toBe('A')
  })

  it('ignora espaços sobrando e põe em maiúscula', () => {
    expect(getInitials('  ana   moura ', EMAIL)).toBe('AM')
  })

  it.each([null, '', '   '])('cai na primeira letra do e-mail quando o nome é %j', (name) => {
    expect(getInitials(name, EMAIL)).toBe('A')
  })
})
