import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import * as v from 'valibot'

import { ProgressSchema } from './progress.types'
import type { Progress } from './progress.types'

// O que a função `progresso_do_aluno` devolve, com os nomes do banco. O gerador de tipos entrega
// `Json`, então quem confere o formato é este schema (`camada-servicos.md`).
const SqlProgressSchema = v.object({
  total_horas: v.number(),
  meta_horas: v.number(),
  faltam_horas: v.number(),
  soma_itens: v.number(),
  itens: v.array(
    v.object({
      numero: v.number(),
      nome: v.string(),
      horas_contadas: v.number(),
      maximo_horas: v.number(),
      horas_excedentes: v.number(),
    }),
  ),
})

/**
 * Lê o progresso do aluno: total, meta, quanto falta e as horas de cada item.
 *
 * @remarks
 * Quem calcula é a função SQL `progresso_do_aluno`, a mesma conta que o teste de paridade compara
 * com `src/utils/compute-hours.ts` (RNF20, ADR 0003 e 0015). Uma ida ao banco. Quem registra,
 * corrige ou remove atividade, ou muda o semestre do perfil, invalida esta query.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns O progresso atual.
 * @throws {Error} O perfil ainda não tem curso. O gate de Seu curso impede chegar aqui.
 * @throws Erro do banco, repassado sem tradução, e resposta fora do formato esperado.
 */
export async function getProgress(db: DbClient = createClient()): Promise<Progress> {
  const { data, error } = await db.rpc('progresso_do_aluno')

  if (error) throw error
  if (data === null) throw new Error('O perfil ainda não tem curso. Escolha o curso em Seu curso.')

  const progress = v.parse(SqlProgressSchema, data)

  return v.parse(ProgressSchema, {
    totalHours: progress.total_horas,
    targetHours: progress.meta_horas,
    missingHours: progress.faltam_horas,
    itemsSum: progress.soma_itens,
    categories: progress.itens.map((item) => ({
      itemNumber: item.numero,
      name: item.nome,
      countedHours: item.horas_contadas,
      maxHours: item.maximo_horas,
      hoursOverLimit: item.horas_excedentes,
    })),
  })
}
