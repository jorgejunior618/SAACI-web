import { beforeAll, describe, expect, it } from 'vitest'

import { confirmEmail, createAccount, signIn, signOut } from '@/services/account'
import { createActivity, getActivities } from '@/services/activities'
import { updateProfile } from '@/services/profile'
import { getProgress } from '@/services/progress'

import { waitForEmailLink } from './helpers/mailpit'

// Progresso contra o Supabase local: o total que o banco devolve é a soma das horas de cada atividade
// da lista, truncada (RF14, RNF20), e o ingresso muda o resultado (RF38). Uma hora a mais no total não
// aparece como erro na tela, por isso o teste é obrigatório (doc/testes.md).
const PASSWORD = 'senhaforte1'
const COURSE_ID = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'
const EMAIL = `it.progresso.${Date.now()}@aluno.ifce.edu.br`

function pdf(name: string): File {
  return new File(['%PDF-1.4 certificado de teste'], name, { type: 'application/pdf' })
}

/** Soma as horas que contam em cada atividade da lista, que é a conta que o progresso tem de igualar. */
async function sumOfActivities(): Promise<{ count: number; sum: number }> {
  const activities = await getActivities()

  return {
    count: activities.length,
    sum: activities.reduce((total, activity) => total + activity.countedHours, 0),
  }
}

beforeAll(async () => {
  await createAccount(EMAIL, PASSWORD)
  await confirmEmail((await waitForEmailLink(EMAIL)).token)
  await signOut()
  await signIn(EMAIL, PASSWORD)
})

describe('progresso', () => {
  it('pede para escolher o curso quando o perfil ainda não tem um', async () => {
    await expect(getProgress()).rejects.toThrow('Escolha o curso em Seu curso.')
  })

  it('o total é a soma das atividades da lista, truncada em horas inteiras', async () => {
    await updateProfile({ courseId: COURSE_ID, startSemester: '2023-07-01' })
    // 8h do item 7, 1,7h do item 6 e 6h do item 13: 15,7h.
    await createActivity({
      name: 'Curso de Git e GitHub',
      itemNumber: 7,
      quantity: 32,
      startDate: '2025-04-07',
      endDate: '2025-05-03',
      proof: pdf('git.pdf'),
    })
    await createActivity({
      name: 'Curso de inglês',
      itemNumber: 6,
      quantity: 7,
      startDate: '2025-08-01',
      endDate: '2025-08-30',
      proof: pdf('ingles.pdf'),
    })
    await createActivity({
      name: 'Ciclo de palestras',
      itemNumber: 13,
      quantity: 3,
      startDate: '2025-09-01',
      endDate: '2025-09-03',
      proof: pdf('palestras.pdf'),
    })

    const [progress, activities] = await Promise.all([getProgress(), sumOfActivities()])

    expect(activities.count).toBeGreaterThan(0) // pré-condição: há o que comparar
    expect(progress.totalHours).toBe(Math.floor(activities.sum))
    expect(progress).toMatchObject({ totalHours: 15, targetHours: 120, missingHours: 105 })
    expect(progress.itemsSum).toBe(15.7)
    expect(progress.categories.map((c) => [c.itemNumber, c.countedHours])).toEqual([
      [6, 1.7],
      [7, 8],
      [13, 6],
    ])
  })

  it('mudar o semestre de ingresso muda o total, e a lista concorda (RF38)', async () => {
    // O curso de Git começou em 2025-04-07, antes do novo ingresso, e deixa de contar.
    await updateProfile({ startSemester: '2025-07-01' })

    const [progress, activities] = await Promise.all([getProgress(), sumOfActivities()])

    expect(activities.count).toBeGreaterThan(0)
    expect(progress.totalHours).toBe(Math.floor(activities.sum))
    expect(progress).toMatchObject({ totalHours: 7, itemsSum: 7.7 })
  })
})
