import { createClient } from '@supabase/client'
import type { Json } from '@supabase/database.types'
import { beforeAll, describe, expect, it } from 'vitest'

import { confirmEmail, createAccount, signIn, signOut } from '@/services/account'
import type { Progress } from '@/services/progress'
import type { ActivityHours, ProgressInput } from '@/utils/compute-hours'

import cases from '../hours-cases.json'
import { waitForEmailLink } from './helpers/mailpit'

// Segundo lado da paridade do cálculo de horas (ADR 0003): os mesmos casos de `tests/hours-cases.json`
// que rodam contra `compute-hours.ts` rodam aqui contra a função SQL `calcula_horas`. Divergência entre
// as duas quebra o teste, e a prévia do formulário só fica no navegador enquanto os dois lados batem.
const PASSWORD = 'senhaforte1'

type HoursCase = {
  name: string
  input: ProgressInput
  expected: { activities: ActivityHours[]; progress: Progress }
}

type SqlResult = {
  atividades: {
    id: string
    horas_atividade: number
    horas_contadas: number
    situacao: ActivityHours['status']
    motivo: ActivityHours['reason']
  }[]
  progresso: {
    total_horas: number
    meta_horas: number
    faltam_horas: number
    soma_itens: number
    itens: {
      numero: number
      nome: string
      horas_contadas: number
      maximo_horas: number
      horas_excedentes: number
    }[]
  }
}

// Traduz o caso (camelCase, como o TypeScript) para a entrada da função SQL (nomes do banco).
function toSqlInput({ activities, ruleItems, startSemester, targetHours }: ProgressInput): Json {
  return {
    semestre_inicio: startSemester,
    meta_horas: targetHours,
    itens: ruleItems.map((rule) => ({
      numero: rule.itemNumber,
      nome: rule.name,
      horas: rule.ratio.hours,
      a_cada: rule.ratio.per,
      maximo_horas: rule.maxHours,
    })),
    atividades: activities.map((activity) => ({
      id: activity.id,
      item_numero: activity.itemNumber,
      quantidade: activity.quantity,
      data_inicio: activity.startDate,
      registrado_em: activity.registeredAt,
    })),
  }
}

function fromSqlResult(result: SqlResult): { activities: ActivityHours[]; progress: Progress } {
  const { progresso } = result

  return {
    activities: result.atividades.map((activity) => ({
      id: activity.id,
      activityHours: activity.horas_atividade,
      countedHours: activity.horas_contadas,
      status: activity.situacao,
      reason: activity.motivo,
    })),
    progress: {
      totalHours: progresso.total_horas,
      targetHours: progresso.meta_horas,
      missingHours: progresso.faltam_horas,
      itemsSum: progresso.soma_itens,
      categories: progresso.itens.map((item) => ({
        itemNumber: item.numero,
        name: item.nome,
        countedHours: item.horas_contadas,
        maxHours: item.maximo_horas,
        hoursOverLimit: item.horas_excedentes,
      })),
    },
  }
}

beforeAll(async () => {
  const email = `it.paridade.${Date.now()}@aluno.ifce.edu.br`

  await createAccount(email, PASSWORD)
  await confirmEmail((await waitForEmailLink(email)).token)
  await signOut()
  await signIn(email, PASSWORD)
})

describe('paridade do cálculo de horas: SQL', () => {
  it('há casos para comparar', () => {
    expect(cases.cases.length).toBeGreaterThan(0)
  })

  it.each((cases.cases as HoursCase[]).map((c) => [c.name, c] as const))(
    '%s',
    async (_, hoursCase) => {
      const { data, error } = await createClient().rpc('calcula_horas', {
        entrada: toSqlInput(hoursCase.input),
      })

      if (error) throw error
      expect(fromSqlResult(data as SqlResult)).toEqual(hoursCase.expected)
    },
  )
})
