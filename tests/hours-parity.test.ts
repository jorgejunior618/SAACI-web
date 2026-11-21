import { describe, expect, it } from 'vitest'

import type { Progress } from '@/services/progress'
import { computeActivities, computeProgress } from '@/utils/compute-hours'
import type { ActivityHours, ProgressInput } from '@/utils/compute-hours'

import cases from './hours-cases.json'

// Os casos são o contrato do cálculo único. Aqui rodam contra a função TS. O mesmo arquivo roda
// contra a função SQL `calcula_horas` em `tests/integration/hours-parity.test.ts`, e a prévia do
// formulário só continua no navegador enquanto os dois lados passarem.
type HoursCase = {
  name: string
  input: ProgressInput
  expected: { activities: ActivityHours[]; progress: Progress }
}

describe('paridade do cálculo de horas: TypeScript', () => {
  it.each((cases.cases as HoursCase[]).map((c) => [c.name, c] as const))('%s', (_, hoursCase) => {
    const { input, expected } = hoursCase

    expect(computeActivities(input.activities, input.ruleItems, input.startSemester)).toEqual(
      expected.activities,
    )
    expect(computeProgress(input)).toEqual(expected.progress)
  })
})
