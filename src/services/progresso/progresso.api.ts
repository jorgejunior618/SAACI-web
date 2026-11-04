import * as v from 'valibot'

import { readDb, simularLatencia } from '../_mock'
import { AtividadeSchema } from '../atividades/atividades.types'
import { requireConta } from '../conta/conta.api'
import { getCursoSync } from '../cursos/cursos.api'

import { calcularItem, calcularTotal } from './progresso.calc'
import type { AtividadeComResultado, Progresso } from './progresso.types'

export class SemCursoError extends Error {
  constructor() {
    super('Escolha o seu curso para ver o progresso.')
    this.name = 'SemCursoError'
  }
}

export async function getProgresso(): Promise<Progresso> {
  await simularLatencia()
  const conta = requireConta()
  const curso = conta.cursoId ? getCursoSync(conta.cursoId) : null
  if (!curso || !conta.ingresso) throw new SemCursoError()

  const ingresso = conta.ingresso
  const atividades = v.parse(v.array(AtividadeSchema), readDb().atividades)
  const porId = new Map(atividades.map((a) => [a.id, a]))

  const itens = curso.itens.map((item) => {
    const {
      atividades: resultados,
      usado,
      cabem,
      registrado,
      excedente,
      isCheio,
    } = calcularItem(item, atividades, ingresso)
    const comResultado: AtividadeComResultado[] = resultados
      .map(({ id, ...resultado }) => ({ ...porId.get(id)!, ...resultado }))
      .sort((a, b) => b.dataFim.localeCompare(a.dataFim))

    return { usado, cabem, registrado, excedente, isCheio, item, atividades: comResultado }
  })

  const ultima = [...atividades].sort((a, b) => b.registradaEm.localeCompare(a.registradaEm))[0]
  const itemDaUltima = ultima && itens.find((i) => i.item.numero === ultima.itemNumero)

  return {
    curso,
    ingresso,
    total: calcularTotal(itens, curso.meta),
    itens,
    itemRecemCompleto: itemDaUltima?.isCheio ? itemDaUltima.item.numero : null,
  }
}
