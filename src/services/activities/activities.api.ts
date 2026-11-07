import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { findActivity, listActivities, proofUrl, suggestFromFile } from './activities.mock'
import { ActivitySchema, ProofSuggestionSchema } from './activities.types'
import type { Activity, ProofSuggestion } from './activities.types'

/**
 * Lista as atividades do aluno, ordenadas por item e, dentro do item, pela data em que terminaram.
 *
 * @returns Todas as atividades, inclusive as que não contam. Lista vazia para quem não registrou.
 */
export async function getActivities(): Promise<Activity[]> {
  await simulateLatency()

  return v.parse(v.array(ActivitySchema), listActivities())
}

/**
 * Busca uma atividade pelo id.
 *
 * @param id Identificador da atividade.
 * @returns A atividade, ou `null` quando não existe ou não é do aluno. A tela chama `notFound()`.
 */
export async function getActivity(id: string): Promise<Activity | null> {
  await simulateLatency()
  const activity = findActivity(id)

  return activity ? v.parse(ActivitySchema, activity) : null
}

/**
 * Pede a leitura do comprovante e devolve o que ela sugere para o formulário.
 *
 * @remarks
 * Alvo: o serviço de IA é chamado por um Route Handler, e a chave nunca chega ao navegador (RF41).
 * No mock, o nome do arquivo escolhe o resultado: `ilegivel` falha e `sem-item` não sugere item.
 *
 * @param comprovante Arquivo escolhido pelo aluno.
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
