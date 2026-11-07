import type { Progress } from './progress.types'

// Snapshot fixo do protótipo (Início, "Com atividades"): 59h de 120h. Bate com as 9 atividades do
// mock de `activities`, e `tests/seeds-consistentes.test.ts` confere isso. Registrar ou remover
// atividade NÃO muda este número até a issue do cálculo único de horas (RNF20) trocar o mock por
// uma função de verdade.
const SNAPSHOT: Progress = {
  totalHours: 59,
  targetHours: 120,
  missingHours: 61,
  itemsSum: 59,
  categories: [
    {
      itemNumber: 6,
      name: 'Curso de línguas',
      countedHours: 15,
      maxHours: 60,
      hoursOverLimit: 0,
    },
    {
      itemNumber: 7,
      name: 'Curso na área de engenharia de computação',
      countedHours: 18,
      maxHours: 60,
      hoursOverLimit: 0,
    },
    {
      itemNumber: 12,
      name: 'Participação em eventos técnicos ou científicos na área do curso',
      countedHours: 16,
      maxHours: 40,
      hoursOverLimit: 0,
    },
    {
      itemNumber: 13,
      name: 'Ouvinte em palestras da área do curso',
      countedHours: 10,
      maxHours: 30,
      hoursOverLimit: 0,
    },
  ],
}

/** Progresso do aluno logado. */
export function readProgress(): Progress {
  return structuredClone(SNAPSHOT)
}
