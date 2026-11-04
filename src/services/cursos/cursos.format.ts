import { formatNumero } from '@/utils/numeros'

import type { Item } from './cursos.types'

// "40h de curso", "3 palestras", "fator 0,85".
export function formatQuantidade(item: Pick<Item, 'unidade'>, quantidade: number): string {
  const { unidade } = item
  const numero = formatNumero(quantidade)

  switch (unidade.tipo) {
    case 'horas':
      return `${numero}h ${unidade.complemento}`
    case 'contagem':
      return `${numero} ${quantidade === 1 ? unidade.singular : unidade.plural}`
    case 'qualis':
      return `fator ${numero}`
  }
}

// Valor curto para a lista de dados: "40h", "3".
export function formatQuantidadeCurta(item: Pick<Item, 'unidade'>, quantidade: number): string {
  return item.unidade.tipo === 'horas' ? `${formatNumero(quantidade)}h` : formatNumero(quantidade)
}

// Primeira linha da tabela "Como foi calculado": "40h de curso ÷ 4", "3 palestras × 2h".
export function descreverCalculo(
  item: Pick<Item, 'unidade' | 'conversao'>,
  quantidade: number,
): string {
  const { horas, por } = item.conversao

  if (item.unidade.tipo === 'qualis') return `${horas}h × fator ${formatNumero(quantidade)}`

  const quantidadeTexto = formatQuantidade(item, quantidade)
  if (item.unidade.tipo === 'horas') {
    if (horas === 1) return `${quantidadeTexto} ÷ ${por}`
    if (por === 1) return `${quantidadeTexto} × ${horas}`
  }
  if (por === 1) return `${quantidadeTexto} × ${horas}h`
  return `${quantidadeTexto} × ${horas}h ÷ ${por}`
}

// "cada 4h de curso valem 1h", "cada palestra vale 2h".
export function descreverRegraCurta(item: Pick<Item, 'unidade' | 'conversao'>): string {
  const { horas, por } = item.conversao
  const { unidade } = item

  switch (unidade.tipo) {
    case 'horas':
      return por === 1
        ? `cada 1h ${unidade.complemento} vale ${horas}h`
        : `cada ${por}h ${unidade.complemento} valem ${horas}h`
    case 'contagem':
      return por === 1
        ? `cada ${unidade.singular} vale ${horas}h`
        : `cada ${por} ${unidade.plural} valem ${horas}h`
    case 'qualis':
      return `cada trabalho vale ${horas}h vezes o fator Qualis`
  }
}
