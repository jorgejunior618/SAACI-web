export const DOMINIO_ALUNO = '@aluno.ifce.edu.br'

export function isEmailAluno(email: string): boolean {
  const normalizado = email.trim().toLowerCase()
  return normalizado.endsWith(DOMINIO_ALUNO) && normalizado.length > DOMINIO_ALUNO.length
}

export type AvaliacaoSenha = {
  faltamCaracteres: number
  hasLetraENumero: boolean
  isValida: boolean
}

export const TAMANHO_MINIMO_SENHA = 8

// Pelo menos 8 caracteres, com uma letra e um número.
export function avaliarSenha(senha: string): AvaliacaoSenha {
  const faltamCaracteres = Math.max(TAMANHO_MINIMO_SENHA - senha.length, 0)
  const hasLetraENumero = /\p{L}/u.test(senha) && /\d/.test(senha)

  return { faltamCaracteres, hasLetraENumero, isValida: faltamCaracteres === 0 && hasLetraENumero }
}

// Semestre no formato 2023.2.
export function isSemestre(texto: string): boolean {
  return /^(19|20)\d{2}\.[12]$/.test(texto.trim())
}
