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
