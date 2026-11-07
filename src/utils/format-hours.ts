/** Opções de {@link formatHours}. */
export type FormatHoursOptions = {
  /** Casas depois da vírgula. Padrão: 1 ("4,0h"). Use 0 para o total inteiro ("47h"). */
  fractionDigits?: 0 | 1
}

const formatters = {
  0: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  1: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
}

/**
 * Escreve um número de horas no formato do produto, com vírgula e o sufixo "h".
 *
 * @remarks
 * Só formata: não soma nem arredonda para baixo. O valor chega pronto do service (RNF20). Com
 * `fractionDigits: 0` o número é arredondado pela regra padrão do `Intl`, então quem quer o piso
 * aplica `Math.floor` antes.
 *
 * @param value Horas já calculadas.
 * @param options Quantidade de casas decimais.
 * @returns O texto, por exemplo `"4,0h"` ou `"47h"`.
 *
 * @example
 * ```ts
 * formatHours(18) // "18,0h"
 * formatHours(47, { fractionDigits: 0 }) // "47h"
 * ```
 */
export function formatHours(
  value: number,
  { fractionDigits = 1 }: FormatHoursOptions = {},
): string {
  return `${formatters[fractionDigits].format(value)}h`
}
