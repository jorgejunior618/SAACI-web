/**
 * Tira as iniciais para o círculo do Perfil: a primeira letra do primeiro e do último nome.
 *
 * @param name Nome do perfil, ou `null` quando ainda não foi preenchido.
 * @param email E-mail da conta, usado quando não há nome.
 * @returns Até duas letras maiúsculas. Com um nome só, uma letra.
 *
 * @example
 * getInitials('Ana Beatriz Moura', 'ana@aluno.ifce.edu.br') // 'AM'
 */
export function getInitials(name: string | null, email: string): string {
  const words = (name ?? '').split(/\s+/).filter(Boolean)
  const first = words[0]
  const last = words.length > 1 ? words[words.length - 1] : undefined

  if (!first) return email.charAt(0).toUpperCase()
  return `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase()
}
