import { hojeIso } from '@/utils/datas'

import { calcularItem } from './progresso.calc'
import type { Progresso, Simulacao } from './progresso.types'

export type EntradaSimulacao = {
  // Na correção, a própria atividade sai da conta antes de simular.
  id?: string
  itemNumero: number
  quantidade: number
  dataFim: string | null
}

// Prévia de quanto uma atividade vai contar, com a mesma regra do total (RNF20).
export function simularAtividade(progresso: Progresso, entrada: EntradaSimulacao): Simulacao {
  const itemProgresso = progresso.itens.find((i) => i.item.numero === entrada.itemNumero)
  if (!itemProgresso) throw new Error(`Item ${entrada.itemNumero} não existe neste curso.`)

  const { item } = itemProgresso
  const outras = progresso.itens
    .flatMap((i) => i.atividades)
    .filter((a) => a.itemNumero === item.numero && a.id !== entrada.id)
  const semEla = calcularItem(item, outras, progresso.ingresso)

  const candidata = {
    id: '__simulacao__',
    itemNumero: item.numero,
    quantidade: entrada.quantidade,
    dataFim: entrada.dataFim ?? hojeIso(),
    registradaEm: new Date().toISOString(),
  }
  const comEla = calcularItem(item, [...outras, candidata], progresso.ingresso)
  const resultado = comEla.atividades.find((a) => a.id === candidata.id)!

  return {
    valor: resultado.valor,
    cabem: semEla.cabem,
    usadoPorOutras: semEla.usado,
    vaiContar: resultado.contada,
    status: resultado.status,
    motivo: resultado.motivo,
  }
}

// Total feito sem uma atividade, para a confirmação de remover mostrar "volta de 69h para 59h".
// Recalcula o item inteiro: tirar uma atividade pode fazer outra deixar de contar só em parte.
export function simularRemocao(progresso: Progresso, id: string): number {
  const usadoPorItem = progresso.itens.map(({ item, atividades }) =>
    atividades.some((a) => a.id === id)
      ? calcularItem(
          item,
          atividades.filter((a) => a.id !== id),
          progresso.ingresso,
        ).usado
      : atividades.reduce((soma, a) => soma + a.contada, 0),
  )

  return Math.floor(usadoPorItem.reduce((soma, usado) => soma + usado, 0) + 1e-6)
}
