import type { Atividade } from '../atividades/atividades.types'
import type { Curso, Item } from '../cursos/cursos.types'

import type { ResultadoAtividade, ResultadoItem, ResultadoTotal } from './progresso.calc'

export type AtividadeComResultado = Atividade & Omit<ResultadoAtividade, 'id'>

export type ItemComProgresso = Omit<ResultadoItem, 'atividades' | 'numero' | 'limite'> & {
  item: Item
  atividades: AtividadeComResultado[]
}

export type Progresso = {
  curso: Curso
  ingresso: string
  total: ResultadoTotal
  // Os 24 itens, na ordem do formulário.
  itens: ItemComProgresso[]
  // Item que encheu com a atividade registrada por último, para o aviso do Início.
  itemRecemCompleto: number | null
}

export type Simulacao = {
  valor: number
  cabem: number
  usadoPorOutras: number
  vaiContar: number
  status: ResultadoAtividade['status']
  motivo: ResultadoAtividade['motivo']
}
