import {
  ActivityNotFoundError,
  InvalidActivityDatesError,
  ProofDownloadError,
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

// O arquivo que o aluno enviou, como o Storage guardaria. As seeds não têm: o mock gera um PDF.
let files = new Map<string, File>()

/** Volta o mock às 9 atividades de exemplo. Testes chamam no `beforeEach`. */
export function resetActivitiesMock(): void {
  activities = seedActivities()
  files = new Map()
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
  files.set(activity.id, input.proof)
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
  files.delete(id)
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

// PDF de uma página com o nome da atividade, para o arquivo de exemplo abrir no leitor. Os
// deslocamentos da tabela `xref` são calculados, como o formato pede. O texto fica só em ASCII: a
// fonte padrão do PDF não tem acento, e assim cada caractere ocupa um byte e os deslocamentos batem.
function samplePdf(title: string): Blob {
  const text = title
    .normalize('NFD')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/[\\()]/g, '')
  const stream = `BT /F1 14 Tf 72 720 Td (Comprovante de exemplo: ${text}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let body = '%PDF-1.4\n'
  const offsets = objects.map((object, index) => {
    const offset = body.length
    body += `${index + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  return new Blob([body], { type: 'application/pdf' })
}

/**
 * Arquivo do comprovante, como o Storage devolveria. O enviado pelo aluno volta como cópia; o das seeds é
 * um PDF de exemplo. Nome com `falha-download` falha, para a tela exercitar o erro.
 */
export function proofFile(id: string): Blob {
  const found = activities.find((item) => item.id === id)

  if (!found) throw new ActivityNotFoundError()
  if (found.proof.fileName.includes('falha-download')) throw new ProofDownloadError()
  const stored = files.get(id)

  // Cópia, como uma resposta de rede: quem recebe não segura o arquivo guardado no mock.
  return stored ? new File([stored], stored.name, { type: stored.type }) : samplePdf(found.name)
}
