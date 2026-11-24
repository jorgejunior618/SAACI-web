// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import type { Tables } from '@supabase/database.types'
import * as v from 'valibot'

import { computeActivities } from '@/utils/compute-hours'

import { getProfile } from '../profile/profile.api'
import { getRuleItems } from '../rules/rules.api'
import type { RuleItem } from '../rules/rules.types'
import {
  ActivityNotFoundError,
  isDatabaseRejection,
  ProofDownloadError,
  UnreadableProofError,
} from './activities.errors'
import { ActivitySchema, ProofSuggestionSchema, toProofType } from './activities.types'
import type { Activity, ProofSuggestion } from './activities.types'

/** Bucket privado dos comprovantes, com uma pasta por aluno (ADR 0004). */
export const PROOF_BUCKET = 'comprovantes'

/** Vida da URL assinada do comprovante, em segundos. Basta para abrir; a tela pede outra a cada vez. */
const PROOF_URL_TTL_SECONDS = 60

/**
 * Colunas do `select` da atividade. Listadas porque `select('*')` não é permitido.
 *
 * @remarks
 * Uso interno do domínio, fora do `index.ts`: a leitura e o `updateActivity`, que pede a linha
 * corrigida de volta no próprio `update` para não ler de novo depois do commit.
 */
export const ACTIVITY_COLUMNS =
  'id, nome, item_numero, quantidade, data_inicio, data_fim, created_at, updated_at, comprovante_nome, comprovante_tamanho, comprovante_tipo'

/** Linha de `atividades` com as colunas que a leitura pede, em `snake_case`. */
export type ActivityRow = Pick<
  Tables<'atividades'>,
  | 'id'
  | 'nome'
  | 'item_numero'
  | 'quantidade'
  | 'data_inicio'
  | 'data_fim'
  | 'created_at'
  | 'updated_at'
  | 'comprovante_nome'
  | 'comprovante_tamanho'
  | 'comprovante_tipo'
>

/** Atividade como o banco guarda: sem as horas, que o cálculo único deriva na leitura. */
type StoredActivity = Omit<Activity, 'activityHours' | 'countedHours' | 'status' | 'reason'>

/**
 * Tudo de que o cálculo único precisa: as atividades sem horas, as regras do curso e o semestre de
 * ingresso. Lido de uma vez por {@link readActivityContext}.
 */
export type ActivityContext = {
  stored: StoredActivity[]
  ruleItems: RuleItem[]
  startSemester: string | null
}

const UuidSchema = v.pipe(v.string(), v.uuid())

/**
 * Diz se o id pode existir no banco.
 *
 * @remarks
 * Uso interno do domínio. Id que não é uuid faria o Postgres responder com erro de tipo (22P02) em
 * vez de "nada encontrado". Conferir antes mantém o contrato: atividade desconhecida não existe.
 *
 * @param id Identificador recebido da tela, em geral da URL.
 * @returns `true` quando o id tem formato de uuid.
 */
export function isActivityId(id: string): boolean {
  return v.is(UuidSchema, id)
}

/**
 * Traduz a linha de `atividades` para a atividade sem horas, em `camelCase`.
 *
 * @remarks
 * Uso interno do domínio: a leitura, o `createActivity`, que monta a linha nova com o que a RPC
 * devolveu, e o `updateActivity`, com a linha que o `update` devolveu. Não valida; quem valida é o
 * `v.parse` de {@link attachHours}.
 *
 * @param row Linha do banco, ou montada com as mesmas colunas.
 * @returns A atividade sem `activityHours`, `countedHours`, `status` e `reason`.
 */
export function toStoredActivity(row: ActivityRow): StoredActivity {
  return {
    id: row.id,
    name: row.nome,
    itemNumber: row.item_numero,
    quantity: row.quantidade,
    startDate: row.data_inicio,
    endDate: row.data_fim,
    registeredAt: row.created_at,
    updatedAt: row.updated_at,
    proof: {
      fileName: row.comprovante_nome,
      sizeBytes: row.comprovante_tamanho,
      // Tipo fora da lista lança, como o `check` do banco recusaria.
      type: toProofType(row.comprovante_tipo),
    },
  }
}

/**
 * Lê o que o cálculo único precisa: o perfil, as regras do curso e as atividades do aluno.
 *
 * @remarks
 * Uso interno do domínio, fora do `index.ts`. São três idas ao banco. O `createActivity` e o
 * `updateActivity` chamam esta função **antes** de gravar, para que nada vá à rede depois do commit.
 *
 * @param db Cliente do Supabase.
 * @returns As atividades sem horas, na ordem da lista (item, data de fim e registro), as regras e
 * o semestre de ingresso.
 */
export async function readActivityContext(db: DbClient): Promise<ActivityContext> {
  const profile = await getProfile(db)
  const [ruleItems, rows] = await Promise.all([
    profile.courseId ? getRuleItems(profile.courseId, db) : Promise.resolve([]),
    db
      .from('atividades')
      .select(ACTIVITY_COLUMNS)
      .order('item_numero')
      .order('data_fim')
      .order('created_at'),
  ])

  if (rows.error) throw rows.error
  return {
    stored: rows.data.map(toStoredActivity),
    ruleItems,
    startSemester: profile.startSemester,
  }
}

/**
 * Junta às atividades as horas do cálculo único, sem ir à rede.
 *
 * @remarks
 * Uso interno do domínio. Calcula sempre a lista inteira, porque o máximo do item é dividido entre
 * as atividades pela ordem de registro. A conta é a do TypeScript, que o teste de paridade compara
 * com a função SQL do progresso (ADR 0015).
 *
 * @param context Atividades, regras e semestre, como {@link readActivityContext} devolve.
 * @returns As atividades na mesma ordem, validadas pelo `ActivitySchema`.
 */
export function attachHours({ stored, ruleItems, startSemester }: ActivityContext): Activity[] {
  const hours = computeActivities(stored, ruleItems, startSemester)

  return v.parse(
    v.array(ActivitySchema),
    stored.map((activity, index) => ({ ...activity, ...hours[index] })),
  )
}

/**
 * Lê todas as atividades do aluno já com as horas do cálculo único, na ordem da lista.
 *
 * @remarks
 * Uso interno do domínio (api, mutations e `progress`), fora do `index.ts`. É
 * {@link readActivityContext} seguida de {@link attachHours}.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns As atividades validadas pelo `ActivitySchema`, por item e pela data de fim.
 */
export async function readActivitiesWithHours(db: DbClient = createClient()): Promise<Activity[]> {
  return attachHours(await readActivityContext(db))
}

/**
 * Lista as atividades do aluno, ordenadas por item e, dentro do item, pela data em que terminaram.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns Todas as atividades, inclusive as que não contam, com `countedHours`, `status` e
 * `reason` do cálculo único. Lista vazia para quem não registrou.
 */
export async function getActivities(db: DbClient = createClient()): Promise<Activity[]> {
  return readActivitiesWithHours(db)
}

/**
 * Busca uma atividade pelo id.
 *
 * @param id Identificador da atividade.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns A atividade, ou `null` quando não existe ou não é do aluno. A tela chama `notFound()`.
 */
export async function getActivity(
  id: string,
  db: DbClient = createClient(),
): Promise<Activity | null> {
  if (!isActivityId(id)) return null
  const activities = await readActivitiesWithHours(db)

  return activities.find((activity) => activity.id === id) ?? null
}

/** Rota do Route Handler que lê o comprovante com IA (RF41). A chave do serviço fica no servidor. */
const PROOF_READING_PATH = '/api/comprovante/leitura'

/** Prazo da leitura no navegador, em milissegundos. O servidor corta a chamada à IA antes, em 18 s. */
const PROOF_READING_TIMEOUT_MS = 20_000

/**
 * Pede a leitura do comprovante ao servidor e devolve o que ela sugere para o formulário.
 *
 * @remarks
 * Envia o arquivo ao Route Handler `/api/comprovante/leitura`, que chama o serviço de IA (ADR 0016).
 * Só sugere: nada é gravado. Resposta 422, falha de rede e estouro do prazo de 20 s viram
 * `UnreadableProofError`. Outro status (sem sessão, erro do servidor) rejeita com `Error`, e a tela
 * trata do mesmo jeito: deixa preencher à mão.
 *
 * @param proof Arquivo escolhido pelo aluno.
 * @returns A sugestão. Campo `null` é o que não foi lido.
 * @throws {UnreadableProofError} A leitura não deu. A tela deixa preencher à mão.
 * @throws Error quando o servidor responde com um status inesperado.
 */
export async function readProof(proof: File): Promise<ProofSuggestion> {
  const body = new FormData()
  body.append('proof', proof)

  const response = await fetch(PROOF_READING_PATH, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(PROOF_READING_TIMEOUT_MS),
  }).catch(() => {
    // `fetch` só rejeita por rede caída, cancelamento ou prazo estourado.
    throw new UnreadableProofError()
  })

  if (response.status === 422) throw new UnreadableProofError()
  if (!response.ok) throw new Error(`A leitura do comprovante falhou (HTTP ${response.status}).`)

  return v.parse(ProofSuggestionSchema, await response.json())
}

/**
 * Lê o caminho do comprovante de uma atividade no bucket.
 *
 * @remarks
 * Uso interno do domínio. A RLS só devolve a linha do dono, então a atividade de outro aluno se
 * comporta como inexistente.
 *
 * @param id Identificador da atividade.
 * @param db Cliente do Supabase.
 * @param signal Cancela a leitura, quando quem chama já pode ser cancelado (o download em lote).
 * @returns O caminho `<aluno>/<arquivo>` dentro do bucket `comprovantes`.
 * @throws {ActivityNotFoundError} A atividade não existe ou não é do aluno.
 */
export async function readProofPath(
  id: string,
  db: DbClient,
  signal?: AbortSignal,
): Promise<string> {
  if (!isActivityId(id)) throw new ActivityNotFoundError()

  const query = db.from('atividades').select('comprovante_caminho').eq('id', id)
  const { data, error } = await (signal ? query.abortSignal(signal) : query).maybeSingle()

  if (error) throw error
  if (!data) throw new ActivityNotFoundError()
  return data.comprovante_caminho
}

/**
 * Pede o endereço para ver ou baixar o comprovante de uma atividade.
 *
 * @param id Identificador da atividade.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns URL assinada que vale 60 segundos. Peça de novo a cada abertura, não guarde.
 * @throws {ActivityNotFoundError} A atividade não existe.
 */
export async function getProofUrl(id: string, db: DbClient = createClient()): Promise<string> {
  const path = await readProofPath(id, db)
  const { data, error } = await db.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(path, PROOF_URL_TTL_SECONDS)

  if (error) throw error
  return v.parse(v.pipe(v.string(), v.url()), data.signedUrl)
}

/**
 * Baixa o arquivo do comprovante de uma atividade, para juntar num arquivo compactado.
 *
 * @remarks
 * Usa `storage.download` do bucket `comprovantes`, que só entrega o arquivo da pasta do próprio aluno
 * (ADR 0004). Para abrir um comprovante só, use `getProofUrl`. O cancelamento vale também para a
 * leitura do caminho. Falha de rede, na leitura do caminho ou no download, vira `ProofDownloadError`;
 * recusa do banco (erro com código) passa como está.
 *
 * @param id Identificador da atividade.
 * @param signal Cancela o download. Cancelado, a promessa rejeita com o motivo do `abort`.
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns O arquivo, no tipo em que foi enviado (PDF, JPG ou PNG).
 * @throws {ActivityNotFoundError} A atividade não existe.
 * @throws {ProofDownloadError} O arquivo não chegou. Nada foi salvo; dá para tentar de novo.
 */
export async function getProofFile(
  id: string,
  signal?: AbortSignal,
  db: DbClient = createClient(),
): Promise<Blob> {
  signal?.throwIfAborted()
  const path = await readProofPath(id, db, signal).catch((error: unknown) => {
    // Cancelado, rejeita com o motivo do `abort`, como o download.
    signal?.throwIfAborted()
    if (error instanceof ActivityNotFoundError || isDatabaseRejection(error)) throw error
    throw new ProofDownloadError()
  })
  const { data, error } = await db.storage
    .from(PROOF_BUCKET)
    .download(path, {}, signal ? { signal } : undefined)

  signal?.throwIfAborted()
  if (error) throw new ProofDownloadError()
  return v.parse(v.instance(Blob), data)
}
