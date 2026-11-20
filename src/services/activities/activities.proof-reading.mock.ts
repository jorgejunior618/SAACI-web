import { UnreadableProofError } from './activities.errors'
import type { ProofSuggestion } from './activities.types'

// TODO [#22]: leitura fingida do comprovante. A #22 troca por um serviço de IA chamado num Route
// Handler e apaga este arquivo. Aqui a "IA" olha só o nome do arquivo: `ilegivel` falha, `sem-item`
// não sugere nada, o resto devolve o curso de React do protótipo. Serve para a tela exercitar os três
// caminhos.

/**
 * Finge a leitura do comprovante pelo nome do arquivo, até a #22 trazer o serviço de IA.
 *
 * @param file Arquivo escolhido pelo aluno. Só o nome é olhado.
 * @returns A sugestão do protótipo, ou tudo `null` quando o nome tem `sem-item`.
 * @throws {UnreadableProofError} O nome tem `ilegivel`.
 */
export function suggestFromFile(file: File): ProofSuggestion {
  if (file.name.includes('ilegivel')) throw new UnreadableProofError()
  if (file.name.includes('sem-item')) {
    return { itemNumber: null, name: null, quantity: null, startDate: null, endDate: null }
  }

  return {
    itemNumber: 7,
    name: 'Curso de React com TypeScript',
    quantity: 40,
    startDate: '2026-08-03',
    endDate: '2026-09-12',
  }
}
