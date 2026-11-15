import {
  ActivityNotFoundError,
  InvalidActivityDatesError,
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

/**
 * Atividade como o banco guarda: só o que o aluno informou. `activityHours`, `countedHours`, `status` e `reason` são
 * derivados na leitura pelo cálculo único, como uma View faria.
 */
export type StoredActivity = Omit<Activity, 'activityHours' | 'countedHours' | 'status' | 'reason'>

type Seed = [id: number, name: string, item: number, quantity: number, start: string, end: string]

// As 9 atividades do protótipo (Atividades, "Atividade que não conta"). Pelas regras do curso somam
// 59h, e `tests/seeds-consistency.test.ts` confere isso. A última começa antes do ingresso (2023.2)
// e não conta. As datas de início não vêm do protótipo: foram escolhidas para cada atividade caber
// no período que o nome sugere.
const SEEDS: Seed[] = [
  [1, 'Curso de inglês intermediário', 6, 60, '2025-02-03', '2025-06-30'],
  [2, 'Curso de Git e GitHub', 7, 32, '2025-04-07', '2025-05-03'],
  [3, 'Curso de Python para análise de dados', 7, 40, '2025-09-15', '2025-11-14'],
  [4, 'Semana de Engenharia de Computação 2025', 12, 3, '2025-09-17', '2025-09-19'],
  [5, 'Hackathon IFCE', 12, 1, '2026-03-08', '2026-03-08'],
  [6, 'Palestra sobre computação quântica', 13, 1, '2025-03-12', '2025-03-12'],
  [7, 'Palestra sobre IA em sistemas embarcados', 13, 1, '2025-09-20', '2025-09-20'],
  [8, 'Ciclo de Palestras Tech IFCE', 13, 3, '2026-10-20', '2026-10-22'],
  [9, 'Palestra de boas-vindas aos calouros', 13, 1, '2023-02-10', '2023-02-10'],
]

function seedActivities(): StoredActivity[] {
  return SEEDS.map(([n, name, itemNumber, quantity, startDate, endDate]) => ({
    id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
    name,
    itemNumber,
    quantity,
    startDate,
    endDate,
    registeredAt: `${endDate}T12:00:00.000Z`,
    updatedAt: `${endDate}T12:00:00.000Z`,
    proof: {
      fileName: `comprovante-${n}.pdf`,
      sizeBytes: 700_000 + n * 1_000,
      type: 'pdf',
    },
  }))
}

let activities: StoredActivity[] = seedActivities()

/** Volta o mock às 9 atividades de exemplo. Testes chamam no `beforeEach`. */
export function resetActivitiesMock(): void {
  activities = seedActivities()
}

function toType(file: File): Proof['type'] {
  if (file.type === 'application/pdf') return 'pdf'
  return file.type === 'image/png' ? 'png' : 'jpg'
}

/** Atividades ordenadas por item e, dentro do item, pela data em que terminaram. */
export function listActivities(): StoredActivity[] {
  const sorted = [...activities].sort(
    (a, b) => a.itemNumber - b.itemNumber || a.endDate.localeCompare(b.endDate),
  )

  return structuredClone(sorted)
}

/** Grava a atividade nova com o dado bruto. As horas saem do cálculo único, na leitura. */
export function insertActivity(input: NewActivity): StoredActivity {
  const now = new Date().toISOString()
  const activity: StoredActivity = {
    id: crypto.randomUUID(),
    name: input.name,
    itemNumber: input.itemNumber,
    quantity: input.quantity,
    startDate: input.startDate,
    endDate: input.endDate,
    registeredAt: now,
    updatedAt: now,
    proof: {
      fileName: input.proof.name,
      sizeBytes: input.proof.size,
      type: toType(input.proof),
    },
  }

  activities.push(activity)
  return structuredClone(activity)
}

/**
 * Aplica a correção se `updatedAt` ainda é o que o aluno viu. `registeredAt` não muda: corrigir não
 * tira a atividade da vez dela no máximo do item.
 */
export function patchActivity(
  id: string,
  updatedAt: string,
  changes: ActivityCorrection,
): StoredActivity {
  const index = activities.findIndex((item) => item.id === id)
  const current = activities[index]

  if (!current) throw new ActivityNotFoundError()
  if (current.updatedAt !== updatedAt) throw new StaleActivityError()

  const next: StoredActivity = { ...current, ...changes, updatedAt: new Date().toISOString() }

  if (next.endDate < next.startDate) throw new InvalidActivityDatesError()
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

/** Endereço de onde abrir o comprovante. No Supabase vira URL assinada de vida curta. */
export function proofUrl(id: string): string {
  const found = activities.find((item) => item.id === id)

  if (!found) throw new ActivityNotFoundError()
  return `/mock/proofs/${found.proof.fileName}`
}
