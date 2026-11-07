import {
  ActivityNotFoundError,
  StaleActivityError,
  UnreadableProofError,
} from './activities.errors'
import type {
  Activity,
  ActivityCorrection,
  NewActivity,
  Proof,
  ProofSuggestion,
} from './activities.types'

type Seed = [id: number, name: string, item: number, quantity: number, data: string, hours: number]

// As 9 atividades do protótipo (Atividades, "Atividade que não conta"). As horas contadas somam
// 59h, o mesmo do mock de `progress`. A última termina antes do ingresso (2023.2) e não conta.
const SEEDS: Seed[] = [
  [1, 'Curso de inglês intermediário', 6, 60, '2025-06-30', 15],
  [2, 'Curso de Git e GitHub', 7, 32, '2025-05-03', 8],
  [3, 'Curso de Python para análise de dados', 7, 40, '2025-11-14', 10],
  [4, 'Semana de Engenharia de Computação 2025', 12, 3, '2025-09-19', 12],
  [5, 'Hackathon IFCE', 12, 1, '2026-03-08', 4],
  [6, 'Palestra sobre computação quântica', 13, 1, '2025-03-12', 2],
  [7, 'Palestra sobre IA em sistemas embarcados', 13, 1, '2025-09-20', 2],
  [8, 'Ciclo de Palestras Tech IFCE', 13, 3, '2026-10-22', 6],
  [9, 'Palestra de boas-vindas aos calouros', 13, 1, '2023-02-10', 0],
]

function seedActivities(): Activity[] {
  return SEEDS.map(([n, name, itemNumber, quantity, activityDate, countedHours]) => ({
    id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
    name,
    itemNumber,
    quantity,
    activityDate,
    registeredAt: `${activityDate}T12:00:00.000Z`,
    updatedAt: `${activityDate}T12:00:00.000Z`,
    countedHours,
    status: countedHours > 0 ? 'conta' : 'nao_conta',
    reason: countedHours > 0 ? null : 'antes_do_ingresso',
    proof: {
      fileName: `comprovante-${n}.pdf`,
      sizeBytes: 700_000 + n * 1_000,
      type: 'pdf',
    },
  }))
}

let activities: Activity[] = seedActivities()

/** Volta o mock às 9 atividades de exemplo. Testes chamam no `beforeEach`. */
export function resetActivitiesMock(): void {
  activities = seedActivities()
}

function toType(file: File): Proof['type'] {
  if (file.type === 'application/pdf') return 'pdf'
  return file.type === 'image/png' ? 'png' : 'jpg'
}

/** Atividades ordenadas por item e, dentro do item, pela data em que terminaram. */
export function listActivities(): Activity[] {
  const sorted = [...activities].sort(
    (a, b) => a.itemNumber - b.itemNumber || a.activityDate.localeCompare(b.activityDate),
  )

  return structuredClone(sorted)
}

/** Atividade pelo id, ou `null`. */
export function findActivity(id: string): Activity | null {
  const found = activities.find((item) => item.id === id)

  return found ? structuredClone(found) : null
}

// PROVISÓRIO: sem o cálculo único (RNF20) a atividade nova conta a quantidade inteira. A issue do
// cálculo troca isto pela regra do item, do máximo e do ingresso. Não copie esta conta para a tela.
export function insertActivity(input: NewActivity): Activity {
  const now = new Date().toISOString()
  const activity: Activity = {
    id: crypto.randomUUID(),
    name: input.name,
    itemNumber: input.itemNumber,
    quantity: input.quantity,
    activityDate: input.activityDate,
    registeredAt: now,
    updatedAt: now,
    countedHours: input.quantity,
    status: 'conta',
    reason: null,
    proof: {
      fileName: input.proof.name,
      sizeBytes: input.proof.size,
      type: toType(input.proof),
    },
  }

  activities.push(activity)
  return structuredClone(activity)
}

/** Aplica a correção se `updatedAt` ainda é o que o aluno viu. Mesmo provisório de `insertActivity`. */
export function patchActivity(
  id: string,
  updatedAt: string,
  changes: ActivityCorrection,
): Activity {
  const index = activities.findIndex((item) => item.id === id)
  const current = activities[index]

  if (!current) throw new ActivityNotFoundError()
  if (current.updatedAt !== updatedAt) throw new StaleActivityError()

  const next: Activity = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
    countedHours: changes.quantity ?? current.countedHours,
  }

  activities[index] = next
  return structuredClone(next)
}

/** Remove a atividade e o comprovante. */
export function deleteActivity(id: string): void {
  if (!activities.some((item) => item.id === id)) throw new ActivityNotFoundError()
  activities = activities.filter((item) => item.id !== id)
}

// A "IA" do mock olha só o nome do arquivo: `ilegivel` falha, `sem-item` não sugere item, o resto
// devolve o curso de React do protótipo. Serve para a tela exercitar os três caminhos.
export function suggestFromFile(file: File): ProofSuggestion {
  if (file.name.includes('ilegivel')) throw new UnreadableProofError()
  if (file.name.includes('sem-item')) {
    return { itemNumber: null, name: null, quantity: null, activityDate: null }
  }

  return {
    itemNumber: 7,
    name: 'Curso de React com TypeScript',
    quantity: 40,
    activityDate: '2026-09-12',
  }
}

/** Endereço de onde abrir o comprovante. No Supabase vira URL assinada de vida curta. */
export function proofUrl(id: string): string {
  const found = activities.find((item) => item.id === id)

  if (!found) throw new ActivityNotFoundError()
  return `/mock/proofs/${found.proof.fileName}`
}
