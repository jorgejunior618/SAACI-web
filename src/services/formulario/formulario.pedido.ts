import type { Sessao } from '../conta/conta.types'
import type { Progresso } from '../progresso/progresso.types'

export type Pendencia = 'horas' | 'nome' | 'matricula'

export type LinhaFormulario = {
  numero: number
  nome: string
  // Horas solicitadas no item. Null vira traço no formulário.
  horas: number | null
}

export type Pedido = {
  pendencias: Pendencia[]
  comprovantesQueContam: number
  linhas: LinhaFormulario[]
  linhasComHoras: LinhaFormulario[]
  total: number
  feito: number
  meta: number
  faltam: number
}

// Monta o formulário da coordenação a partir do mesmo cálculo do painel (RF37, RNF20).
export function montarPedido(progresso: Progresso, sessao: Sessao): Pedido {
  const linhas = progresso.itens.map(({ item, usado }) => ({
    numero: item.numero,
    nome: item.nome,
    horas: usado > 0 ? usado : null,
  }))

  const pendencias: Pendencia[] = []
  if (progresso.total.faltam > 0) pendencias.push('horas')
  if (!sessao.nome) pendencias.push('nome')
  if (!sessao.matricula) pendencias.push('matricula')

  return {
    pendencias,
    comprovantesQueContam: progresso.itens.flatMap((i) => i.atividades).filter((a) => a.contada > 0)
      .length,
    linhas,
    linhasComHoras: linhas.filter((l) => l.horas !== null),
    total: progresso.total.pedido,
    feito: progresso.total.feito,
    meta: progresso.total.meta,
    faltam: progresso.total.faltam,
  }
}
