// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import { getActiveTab } from './utils'

describe('getActiveTab', () => {
  it('acende a aba da rota raiz', () => {
    expect(getActiveTab('/inicio')).toBe('inicio')
    expect(getActiveTab('/eventos')).toBe('eventos')
    expect(getActiveTab('/perfil')).toBe('perfil')
  })

  it('mantém Atividades acesa no detalhe e no formulário', () => {
    expect(getActiveTab('/atividades')).toBe('atividades')
    expect(getActiveTab('/atividades/abc')).toBe('atividades')
    expect(getActiveTab('/atividades/pedido')).toBe('atividades')
  })

  it('não acende aba em Registrar nem em rota fora da barra', () => {
    expect(getActiveTab('/registrar')).toBeUndefined()
    expect(getActiveTab('/entrar')).toBeUndefined()
  })

  it('não confunde prefixo parecido com a aba', () => {
    expect(getActiveTab('/atividadesx')).toBeUndefined()
  })
})
