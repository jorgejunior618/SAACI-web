import * as v from 'valibot'

import { computeActivities } from '@/utils/compute-hours'
import { simulateLatency } from '@/utils/simulate-latency'

import { getProfile } from '../profile/profile.api'
import { getRuleItems } from '../rules/rules.api'
import { listActivities, proofUrl, suggestFromFile } from './activities.mock'
import type { StoredActivity } from './activities.mock'
import { ActivitySchema, ProofSuggestionSchema } from './activities.types'
import type { Activity, ProofSuggestion } from './activities.types'

/**
 * Lê todas as atividades do aluno já com as horas do cálculo único, na ordem da lista.
 *
 * @remarks
 * Uso interno do domínio (api e mutations), fora do `index.ts`. Faz o papel da View do banco:
 * junta o dado bruto, as regras do curso e o semestre de ingresso do perfil. Calcula
 * sempre a lista inteira, porque o máximo do item é dividido entre as atividades.
 *
 * @returns As atividades validadas pelo `ActivitySchema`.
 */
export async function readActivitiesWithHours(): Promise<Activity[]> {
  const profile = await getProfile()
  const ruleItems = profile.courseId ? await getRuleItems(profile.courseId) : []
  const stored: StoredActivity[] = listActivities()
  const hours = computeActivities(stored, ruleItems, profile.startSemester)

  return v.parse(
    v.array(ActivitySchema),
    stored.map((activity, index) => ({ ...activity, ...hours[index] })),
  )
}

/**
 * Lista as atividades do aluno, ordenadas por item e, dentro do item, pela data em que terminaram.
 *
 * @returns Todas as atividades, inclusive as que não contam, com `countedHours`, `status` e
 * `reason` do cálculo único. Lista vazia para quem não registrou.
 */
export async function getActivities(): Promise<Activity[]> {
  await simulateLatency()

  return readActivitiesWithHours()
}

/**
 * Busca uma atividade pelo id.
 *
 * @param id Identificador da atividade.
 * @returns A atividade, ou `null` quando não existe ou não é do aluno. A tela chama `notFound()`.
 */
export async function getActivity(id: string): Promise<Activity | null> {
  await simulateLatency()
  const activities = await readActivitiesWithHours()

  return activities.find((activity) => activity.id === id) ?? null
}

/**
 * Pede a leitura do comprovante e devolve o que ela sugere para o formulário.
 *
 * @remarks
 * Alvo: o serviço de IA é chamado por um Route Handler, e a chave nunca chega ao navegador.
 * No mock, o nome do arquivo escolhe o resultado: `ilegivel` falha e `sem-item` não sugere item.
 *
 * @param proofArquivo escolhido pelo aluno.
 * @returns A sugestão. Campo `null` é o que não foi lido.
 * @throws {UnreadableProofError} A leitura falhou. A tela deixa preencher à mão.
 */
export async function readProof(proof: File): Promise<ProofSuggestion> {
  await simulateLatency(1_500)

  return v.parse(ProofSuggestionSchema, suggestFromFile(proof))
}

/**
 * Pede o endereço para ver ou baixar o comprovante de uma atividade.
 *
 * @param id Identificador da atividade.
 * @returns Endereço de vida curta. Peça de novo a cada abertura, não guarde.
 * @throws {ActivityNotFoundError} A atividade não existe.
 */
export async function getProofUrl(id: string): Promise<string> {
  await simulateLatency()

  return proofUrl(id)
}
