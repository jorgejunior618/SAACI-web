import * as v from 'valibot'

/** Tamanho mínimo da senha. */
export const PASSWORD_MIN_LENGTH = 8

function hasLetterAndNumber(password: string): boolean {
  return /\p{L}/u.test(password) && /\d/.test(password)
}

function hasMinLength(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH
}

/**
 * As duas regras da senha, na ordem em que aparecem na tela. Fonte única: a lista na tela e o
 * `PasswordSchema` leem daqui.
 */
export const PASSWORD_RULES = [
  { id: 'letterAndNumber', label: 'Uma letra e um número', isMet: hasLetterAndNumber },
  { id: 'minLength', label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`, isMet: hasMinLength },
] as const

/**
 * Quantos caracteres faltam para o tamanho mínimo.
 *
 * @param password Senha digitada até agora.
 * @returns Zero quando já tem o tamanho mínimo.
 */
export function getMissingLength(password: string): number {
  return Math.max(0, PASSWORD_MIN_LENGTH - password.length)
}

/** Senha de conta nova: ao menos 8 caracteres, com uma letra e um número. */
export const PasswordSchema = v.pipe(
  v.string(),
  v.check(hasMinLength, `Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres na senha.`),
  v.check(hasLetterAndNumber, 'Use ao menos uma letra e um número na senha.'),
)
