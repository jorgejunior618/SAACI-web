import { createClient } from '@supabase/client'
import type { DbClient } from '@supabase/client'
import type { Tables } from '@supabase/database.types'
import * as v from 'valibot'

import { computeActivities } from '@/utils/compute-hours'
import { simulateLatency } from '@/utils/simulate-latency'

import { getProfile } from '../profile/profile.api'
import { getRuleItems } from '../rules/rules.api'
import { ActivityNotFoundError, ProofDownloadError } from './activities.errors'
import { suggestFromFile } from './activities.proof-reading.mock'
import { ActivitySchema, ProofSuggestionSchema } from './activities.types'
import type { Activity, Proof, ProofSuggestion } from './activities.types'

/** Bucket privado dos comprovantes, com uma pasta por aluno (ADR 0004). */
export const PROOF_BUCKET = 'comprovantes'

/** Vida da URL assinada do comprovante, em segundos. Basta para abrir; a tela pede outra a cada vez. */
const PROOF_URL_TTL_SECONDS = 60

/** Colunas do `select` da atividade. Listadas porque `select('*')` não é permitido. */
const ACTIVITY_COLUMNS =
  'id, nome, item_numero, quantidade, data_inicio, data_fim, created_at, updated_at, comprovante_nome, comprovante_tamanho, comprovante_tipo'

type ActivityRow = Pick<
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

const PROOF_TYPES: Record<string, Proof['type']> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
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

function toStoredActivity(row: ActivityRow): StoredActivity {
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
      // Tipo fora da lista é recusado pelo `v.parse` da leitura, como o `check` do banco recusaria.
      type: PROOF_TYPES[row.comprovante_tipo] ?? (row.comprovante_tipo as Proof['type']),
    },
  }
}

/**
 * Lê todas as atividades do aluno já com as horas do cálculo único, na ordem da lista.
 *
 * @remarks
 * Uso interno do domínio (api, mutations e `progress`), fora do `index.ts`. Junta as linhas de
 * `atividades`, as regras do curso e o semestre de ingresso do perfil. Calcula sempre a lista
 * inteira, porque o máximo do item é dividido entre as atividades. A #21 leva esta conta para o
 * banco.
 *
 * @param db Cliente do Supabase. No servidor, passe o de `@supabase/server`.
 * @returns As atividades validadas pelo `ActivitySchema`, por item e pela data de fim.
 */
export async function readActivitiesWithHours(db: DbClient = createClient()): Promise<Activity[]> {
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
  const stored = rows.data.map(toStoredActivity)
  const hours = computeActivities(stored, ruleItems, profile.startSemester)

  return v.parse(
    v.array(ActivitySchema),
    stored.map((activity, index) => ({ ...activity, ...hours[index] })),
  )
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

/**
 * Pede a leitura do comprovante e devolve o que ela sugere para o formulário.
 *
 * @remarks
 * Ainda é a leitura fingida (`activities.proof-reading.mock.ts`): o nome do arquivo escolhe o
 * resultado, `ilegivel` falha e `sem-item` não sugere item. A #22 troca pelo serviço de IA, chamado
 * por um Route Handler para a chave nunca chegar ao navegador.
 *
 * @param proof Arquivo escolhido pelo aluno.
 * @returns A sugestão. Campo `null` é o que não foi lido.
 * @throws {UnreadableProofError} A leitura falhou. A tela deixa preencher à mão.
 */
export async function readProof(proof: File): Promise<ProofSuggestion> {
  await simulateLatency(1_500)

  return v.parse(ProofSuggestionSchema, suggestFromFile(proof))
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
 * @returns O caminho `<aluno>/<arquivo>` dentro do bucket `comprovantes`.
 * @throws {ActivityNotFoundError} A atividade não existe ou não é do aluno.
 */
export async function readProofPath(id: string, db: DbClient): Promise<string> {
  if (!isActivityId(id)) throw new ActivityNotFoundError()

  const { data, error } = await db
    .from('atividades')
    .select('comprovante_caminho')
    .eq('id', id)
    .maybeSingle()

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
 * (ADR 0004). Para abrir um comprovante só, use `getProofUrl`.
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
  const path = await readProofPath(id, db)
  const { data, error } = await db.storage
    .from(PROOF_BUCKET)
    .download(path, {}, signal ? { signal } : undefined)

  signal?.throwIfAborted()
  if (error) throw new ProofDownloadError()
  return v.parse(v.instance(Blob), data)
}
