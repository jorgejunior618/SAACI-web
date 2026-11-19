import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import type { TablesUpdate } from '@supabase/database.types'
import type { QueryClient } from '@tanstack/react-query'
import * as v from 'valibot'

import { readCurrentUser } from '../account/account.api'
import { progressKeys } from '../progress/progress.keys'
import {
  ACTIVITY_COLUMNS,
  attachHours,
  isActivityId,
  PROOF_BUCKET,
  readActivitiesWithHours,
  readActivityContext,
  toStoredActivity,
} from './activities.api'
import { ActivityNotFoundError, StaleActivityError, toActivityError } from './activities.errors'
import { activitiesKeys } from './activities.keys'
import { ActivityCorrectionSchema, NewActivitySchema } from './activities.types'
import type { Activity, ActivityCorrection, NewActivity } from './activities.types'

const SESSION_ENDED_MESSAGE = 'Sua sessão acabou. Entre de novo para salvar a atividade.'

const PROOF_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

// Devolve a atividade gravada já com as horas, calculadas sobre a lista inteira.
async function withHours(id: string, db: DbClient): Promise<Activity> {
  const activity = (await readActivitiesWithHours(db)).find((item) => item.id === id)

  if (!activity) throw new ActivityNotFoundError()
  return activity
}

// SHA-256 do arquivo em hexadecimal, para avisar comprovante repetido (RF42). O banco só confere o
// formato: quem calcula é o navegador, que já tem o arquivo em mãos.
async function hashFile(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Só os campos enviados viram coluna. O comprovante não se troca (ADR 0001).
function toCorrectionRow(changes: ActivityCorrection): TablesUpdate<'atividades'> {
  const row: TablesUpdate<'atividades'> = {}

  if (changes.name !== undefined) row.nome = changes.name
  if (changes.itemNumber !== undefined) row.item_numero = changes.itemNumber
  if (changes.quantity !== undefined) row.quantidade = changes.quantity
  if (changes.startDate !== undefined) row.data_inicio = changes.startDate
  if (changes.endDate !== undefined) row.data_fim = changes.endDate
  return row
}

// O que a RPC `registrar_atividade` devolve da linha criada. O gerador de tipos marca toda coluna de
// `returns table` como não nula sem saber; quem confere é este schema (`camada-servicos.md`).
const RegisteredRowSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  created_at: v.string(),
  updated_at: v.string(),
  comprovante_tamanho: v.number(),
  comprovante_tipo: v.string(),
})

// O banco recusou de verdade quando o erro traz um código: SQLSTATE do Postgres (`23503`, `SA024`)
// ou do PostgREST (`PGRST…`). Erro de rede chega sem código, e aí não se sabe se o commit aconteceu:
// a requisição pode ter chegado e só a resposta se perdido.
function isDatabaseRejection(error: { code?: string }): boolean {
  return typeof error.code === 'string' && error.code !== ''
}

/**
 * Registra uma atividade com o comprovante, completa ou nada (RNF24).
 *
 * @remarks
 * Lê perfil, regras e atividades **antes** de subir o arquivo: depois que a RPC grava, nada mais vai
 * à rede, então uma falha de leitura nunca diz "não registrada" para uma atividade gravada. O arquivo
 * sobe para a pasta do aluno, e a RPC `registrar_atividade` grava a atividade numa transação só e
 * devolve a linha criada. O banco recusa a atividade cujo arquivo não está no bucket.
 *
 * Se o banco recusar (erro com código), o arquivo é apagado na hora. Se a falha for de rede, o
 * arquivo fica: a atividade pode ter sido gravada, e apagá-lo a deixaria sem comprovante. Se não foi,
 * a rotina de limpeza apaga o arquivo depois de 1 hora. O que o aluno preencheu continua na tela.
 * Chame `invalidateAfterActivityWrite` no `onSuccess`.
 *
 * Sem parâmetro `db`, ao contrário das outras: o upload do `File` só acontece no navegador, e a tela
 * passa a função direto para o `mutationFn`, que mandaria o contexto da mutation no 2º argumento.
 *
 * @param input Dados da atividade e o arquivo. Aceita PDF, JPG ou PNG, até 10 MB. A data de fim
 * não pode vir antes da de início.
 * @returns A atividade gravada, já com `countedHours`, `status` e `reason` do cálculo único.
 * @throws {InvalidActivityDatesError} O banco recusou as datas.
 * @throws Error quando não há sessão, quando o upload falha ou quando o banco recusa por outro motivo.
 */
export async function createActivity(input: NewActivity): Promise<Activity> {
  const db = createClient()
  const activity = v.parse(NewActivitySchema, input)
  const user = await readCurrentUser(db)

  if (!user) throw new Error(SESSION_ENDED_MESSAGE)

  // Antes do upload: se falhar aqui, nada foi gravado, e "não registrada" é verdade.
  const context = await readActivityContext(db)
  const { proof } = activity
  const path = `${user.id}/${crypto.randomUUID()}.${PROOF_EXTENSIONS[proof.type] ?? 'pdf'}`
  const hash = await hashFile(proof)
  const upload = await db.storage
    .from(PROOF_BUCKET)
    .upload(path, proof, { contentType: proof.type, upsert: false })

  if (upload.error) throw upload.error

  const { data, error } = await db
    .rpc('registrar_atividade', {
      nome: activity.name,
      item_numero: activity.itemNumber,
      quantidade: activity.quantity,
      data_inicio: activity.startDate,
      data_fim: activity.endDate,
      comprovante_caminho: path,
      comprovante_nome: proof.name,
      comprovante_hash: hash,
    })
    .single()

  if (error) {
    // Só com recusa certa. Melhor esforço: se o remove falhar, a rotina de limpeza apaga o arquivo.
    if (isDatabaseRejection(error)) await db.storage.from(PROOF_BUCKET).remove([path])
    throw toActivityError(error)
  }

  // Daqui em diante, só conta local: a lista lida antes mais a linha que a RPC devolveu.
  const registered = v.parse(RegisteredRowSchema, data)
  const created = toStoredActivity({
    ...registered,
    nome: activity.name,
    item_numero: activity.itemNumber,
    quantidade: activity.quantity,
    data_inicio: activity.startDate,
    data_fim: activity.endDate,
    comprovante_nome: proof.name,
  })
  const withNew = attachHours({ ...context, stored: [...context.stored, created] })
  const result = withNew.find((item) => item.id === registered.id)

  // O cálculo devolve uma entrada por atividade enviada, então a nova sempre está na lista.
  if (!result) throw new Error('A atividade foi registrada, mas o cálculo não a encontrou.')
  return result
}

/**
 * Corrige nome, item, quantidade ou data de uma atividade. O comprovante não se troca.
 *
 * @remarks
 * Lê perfil, regras e atividades **antes** do `update`, como o `createActivity`: depois do commit,
 * nada mais vai à rede. Senão, uma leitura que falhasse diria "não salva" para uma correção gravada,
 * e a nova tentativa, com o `updatedAt` antigo, viraria `StaleActivityError`.
 *
 * O `update` só pega a linha se o `updated_at` ainda for o que a tela leu, e devolve a linha
 * corrigida. Zero linhas quer dizer que a atividade mudou ou sumiu, e uma segunda leitura diz qual
 * dos dois (nada foi gravado, então ler é seguro). As horas são recalculadas pelo cálculo único,
 * sobre a lista lida antes com a linha trocada. Chame `invalidateAfterActivityWrite`.
 *
 * @param id Identificador da atividade.
 * @param updatedAt O `updatedAt` que a tela leu, sem mexer no texto. Se a atividade mudou desde
 * então, a escrita é recusada em vez de sobrescrever.
 * @param changes Campos a corrigir. Só os enviados mudam.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns A atividade depois da correção.
 * @throws {ActivityNotFoundError} A atividade não existe.
 * @throws {StaleActivityError} `updatedAt` não bate com o atual.
 * @throws {InvalidActivityDatesError} A correção deixaria o fim antes do início.
 */
export async function updateActivity(
  id: string,
  updatedAt: string,
  changes: ActivityCorrection,
  db: DbClient = createClient(),
): Promise<Activity> {
  const row = toCorrectionRow(v.parse(ActivityCorrectionSchema, changes))

  if (!isActivityId(id)) throw new ActivityNotFoundError()
  // Sem campo a gravar, o `update` do Supabase falharia. Devolver a atividade atual mantém o contrato.
  if (Object.keys(row).length === 0) return withHours(id, db)

  // Antes do `update`: se falhar aqui, nada foi gravado, e "não salva" é verdade.
  const context = await readActivityContext(db)
  const { data, error } = await db
    .from('atividades')
    .update(row)
    .eq('id', id)
    .eq('updated_at', updatedAt)
    .select(ACTIVITY_COLUMNS)
    .maybeSingle()

  if (error) throw toActivityError(error)
  if (!data) {
    const current = await db.from('atividades').select('id').eq('id', id).maybeSingle()

    if (current.error) throw current.error
    throw current.data ? new StaleActivityError() : new ActivityNotFoundError()
  }

  // Daqui em diante, só conta local. A ordem do array não pesa: o cálculo ordena pelo registro.
  const corrected = toStoredActivity(data)
  const others = context.stored.filter((item) => item.id !== id)
  const result = attachHours({ ...context, stored: [...others, corrected] }).find(
    (item) => item.id === id,
  )

  // O cálculo devolve uma entrada por atividade enviada, então a corrigida sempre está na lista.
  if (!result) throw new Error('A atividade foi corrigida, mas o cálculo não a encontrou.')
  return result
}

/**
 * Remove a atividade e apaga o comprovante. Não dá para desfazer.
 *
 * @remarks
 * A linha sai primeiro e o arquivo depois: a ordem inversa deixaria uma atividade sem comprovante
 * se a segunda parte falhasse (RNF24). Se apagar o arquivo falhar, a atividade já saiu e a função
 * não lança; a rotina de limpeza apaga o arquivo sem atividade. Chame
 * `invalidateAfterActivityRemoval` no `onSuccess`, nunca `invalidateAfterActivityWrite`: a segunda
 * derruba o detalhe em que a tela está montada, e o `notFound()` dispara antes da volta à lista.
 *
 * @param id Identificador da atividade.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @throws {ActivityNotFoundError} A atividade não existe.
 */
export async function removeActivity(id: string, db: DbClient = createClient()): Promise<void> {
  if (!isActivityId(id)) throw new ActivityNotFoundError()

  const { data, error } = await db
    .from('atividades')
    .delete()
    .eq('id', id)
    .select('comprovante_caminho')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new ActivityNotFoundError()
  await db.storage.from(PROOF_BUCKET).remove([data.comprovante_caminho])
}

/** Derruba o que registrar ou corrigir uma atividade torna falso: atividades e progresso. */
export function invalidateAfterActivityWrite(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.all })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}

/** Derruba a lista e o progresso, sem tocar no detalhe da atividade removida. */
export function invalidateAfterActivityRemoval(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: progressKeys.all })
}
