import * as v from 'valibot'

import { lerCopia, readDb, simularLatencia } from '../_mock'
import { requireConta } from '../conta/conta.api'

import { arquivosDaSessao } from './atividades.mock'
import { nomeDaCopia } from './atividades.copia'
import { type ArquivoDoComprovante, type Atividade, AtividadeSchema } from './atividades.types'

export async function getAtividades(): Promise<Atividade[]> {
  await simularLatencia()
  requireConta()

  const atividades = [...readDb().atividades].sort((a, b) => b.dataFim.localeCompare(a.dataFim))
  return v.parse(v.array(AtividadeSchema), atividades)
}

export async function getAtividade(id: string): Promise<Atividade | null> {
  await simularLatencia()
  requireConta()

  const atividade = readDb().atividades.find((a) => a.id === id)
  return atividade ? v.parse(AtividadeSchema, atividade) : null
}

// O original enquanto a aba está aberta; depois, a cópia reduzida. Null quando não há nenhum dos dois
// (PDF depois de recarregar, ou foto que não coube no navegador).
export function getArquivoDoComprovante(id: string): ArquivoDoComprovante | null {
  const original = arquivosDaSessao.get(id)
  if (original) {
    return { url: URL.createObjectURL(original), nomeArquivo: original.name, origem: 'original' }
  }

  const copia = lerCopia(id)
  const atividade = readDb().atividades.find((a) => a.id === id)
  if (!copia || !atividade) return null

  return { url: copia, nomeArquivo: nomeDaCopia(atividade.comprovante.nome), origem: 'copia' }
}
