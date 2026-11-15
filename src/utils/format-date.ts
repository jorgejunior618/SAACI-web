/**
 * Escreve uma data ISO (`AAAA-MM-DD`) no formato brasileiro, `DD/MM/AAAA`.
 *
 * @remarks
 * Só reorganiza o texto: não cria `Date`, então o fuso do aparelho nunca muda o dia.
 *
 * @param isoDate Data no formato `AAAA-MM-DD`, como vem do service.
 * @returns A data como o aluno lê, por exemplo `"03/05/2025"`.
 *
 * @example
 * ```ts
 * formatDate('2025-05-03') // "03/05/2025"
 * ```
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')

  return `${day}/${month}/${year}`
}
