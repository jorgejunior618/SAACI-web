import { describe, expect, it } from 'vitest'

import { avaliarSenha } from './validacoes'

describe('avaliarSenha', () => {
  it('conta quantos caracteres faltam', () => {
    expect(avaliarSenha('abc123').faltamCaracteres).toBe(2)
  })

  it('exige letra e número', () => {
    expect(avaliarSenha('abcdefgh').isValida).toBe(false)
    expect(avaliarSenha('abcdefg1').isValida).toBe(true)
  })
})
