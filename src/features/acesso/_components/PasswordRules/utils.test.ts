import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

import { getMissingPasswordLength, isPasswordValid, PASSWORD_RULES, PasswordSchema } from './utils'

const [letterAndNumber, minLength] = PASSWORD_RULES

describe('regras da senha', () => {
  it('exige letra e número juntos', () => {
    expect(letterAndNumber.isMet('saaci1')).toBe(true)
    expect(letterAndNumber.isMet('saaci')).toBe(false)
    expect(letterAndNumber.isMet('12345678')).toBe(false)
  })

  it('exige 8 caracteres e conta quantos faltam', () => {
    expect(minLength.isMet('1234567')).toBe(false)
    expect(minLength.isMet('12345678')).toBe(true)
    expect(getMissingPasswordLength('saaci1')).toBe(2)
    expect(getMissingPasswordLength('senhaforte1')).toBe(0)
  })

  it('só aceita a senha que cumpre as duas regras', () => {
    expect(isPasswordValid('senhaforte1')).toBe(true)
    expect(isPasswordValid('saaci1')).toBe(false)
    expect(isPasswordValid('somenteletras')).toBe(false)
  })

  it('o schema segue as mesmas regras', () => {
    expect(v.safeParse(PasswordSchema, 'senhaforte1').success).toBe(true)
    expect(v.safeParse(PasswordSchema, 'saaci1').success).toBe(false)
    expect(v.safeParse(PasswordSchema, 'somenteletras').success).toBe(false)
  })
})
