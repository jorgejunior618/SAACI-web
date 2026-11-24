// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { CourseConfirmSchema } from './schema'

describe('CourseConfirmSchema', () => {
  it('devolve o semestre como data pronta para o perfil', () => {
    expect(v.parse(CourseConfirmSchema, { startSemester: '2023.2' })).toEqual({
      startSemester: '2023-07-01',
    })
  })

  it('aponta o erro no campo do semestre', () => {
    const result = v.safeParse(CourseConfirmSchema, { startSemester: '2023' })

    expect(result.success).toBe(false)
    expect(result.issues?.[0]?.path?.[0]?.key).toBe('startSemester')
  })
})
