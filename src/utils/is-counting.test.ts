// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { describe, expect, it } from 'vitest'

import type { Activity } from '@/services/activities'

import { isCounting } from './is-counting'

const status = (value: Activity['status']): Activity => ({ status: value }) as Activity

describe('isCounting', () => {
  it.each(['conta', 'parcial'] as const)('considera que "%s" conta no total', (value) => {
    expect(isCounting(status(value))).toBe(true)
  })

  it('considera que "nao_conta" não conta', () => {
    expect(isCounting(status('nao_conta'))).toBe(false)
  })
})
