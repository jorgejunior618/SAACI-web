import { describe, expect, it } from 'vitest'

import { avaliarSenha, isEmailAluno, isSemestre } from './validacoes'

describe('isEmailAluno', () => {
  it('aceita só o e-mail de aluno do IFCE', () => {
    expect(isEmailAluno('ana.moura07@aluno.ifce.edu.br')).toBe(true)
    expect(isEmailAluno('ana@gmail.com')).toBe(false)
    expect(isEmailAluno('@aluno.ifce.edu.br')).toBe(false)
  })
})

describe('avaliarSenha', () => {
  it('conta quantos caracteres faltam', () => {
    expect(avaliarSenha('abc123').faltamCaracteres).toBe(2)
  })

  it('exige letra e número', () => {
    expect(avaliarSenha('abcdefgh').isValida).toBe(false)
    expect(avaliarSenha('abcdefg1').isValida).toBe(true)
  })
})

describe('isSemestre', () => {
  it('aceita ano e semestre 1 ou 2', () => {
    expect(isSemestre('2023.2')).toBe(true)
    expect(isSemestre('2023.3')).toBe(false)
    expect(isSemestre('23.2')).toBe(false)
  })
})
