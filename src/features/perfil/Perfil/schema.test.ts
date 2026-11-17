import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { EnrollmentFormSchema, NAME_MAX_LENGTH, NameFormSchema } from './schema'

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

describe('NameFormSchema', () => {
  it('devolve o nome sem os espaços das pontas e com os do meio juntos', () => {
    expect(v.parse(NameFormSchema, '  Ana   Beatriz  Moura ')).toBe('Ana Beatriz Moura')
  })

  it.each(['', '   '])('recusa o campo em branco ("%s") e diz o que escrever', (text) => {
    const result = v.safeParse(NameFormSchema, text)

    expect(result.success).toBe(false)
    expect(result.issues?.[0]?.message).toBe(
      'Escreva o seu nome completo, como está nos seus documentos.',
    )
  })

  it('recusa nome acima do limite', () => {
    expect(v.is(NameFormSchema, 'a'.repeat(NAME_MAX_LENGTH))).toBe(true)
    expect(v.is(NameFormSchema, 'a'.repeat(NAME_MAX_LENGTH + 1))).toBe(false)
  })
})
