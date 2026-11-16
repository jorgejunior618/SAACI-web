import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { EnrollmentFormSchema } from './schema'

describe('EnrollmentFormSchema', () => {
  it('devolve a matrícula sem os espaços das pontas', () => {
    expect(v.parse(EnrollmentFormSchema, '  2023104501  ')).toBe('2023104501')
  })

  it.each(['', '   '])(
    'transforma o campo em branco ("%s") em null, que apaga a matrícula',
    (text) => {
      expect(v.parse(EnrollmentFormSchema, text)).toBeNull()
    },
  )
})
