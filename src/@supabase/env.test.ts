// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSupabaseEnv } from './env'

describe('getSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('devolve a URL e a publishable key quando as duas estão preenchidas', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_exemplo')

    expect(getSupabaseEnv()).toEqual({
      url: 'https://exemplo.supabase.co',
      publishableKey: 'sb_publishable_exemplo',
    })
  })

  it('nomeia a variável ausente e aponta o README', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_exemplo')

    expect(() => getSupabaseEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL.*README/)
  })

  it('lista as duas variáveis quando nenhuma está preenchida', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')

    expect(() => getSupabaseEnv()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    )
  })
})
