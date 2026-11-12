import { createClient } from '@supabase/client'
import { beforeAll, describe, expect, it } from 'vitest'

import { confirmEmail, createAccount, signIn, signOut } from '@/services/account'
import { getCourse, getCourses, getRuleItems } from '@/services/rules'

import { waitForEmailLink } from './helpers/mailpit'

// Regras do curso contra o Supabase local: a migration carrega Engenharia de Computação, e qualquer
// aluno logado lê. Escrita só por migration (a negação em si é coberta pelo teste pgTAP).
const PASSWORD = 'senhaforte1'
const COURSE_ID = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'

beforeAll(async () => {
  const email = `it.regras.${Date.now()}@aluno.ifce.edu.br`

  await createAccount(email, PASSWORD)
  await confirmEmail((await waitForEmailLink(email)).token)
  await signOut()
  await signIn(email, PASSWORD)
})

describe('regras do curso', () => {
  it('entrega os 24 itens do formulário em ordem', async () => {
    const items = await getRuleItems(COURSE_ID)

    expect(items).toHaveLength(24)
    expect(items.map((item) => item.itemNumber)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1),
    )
  })

  it('busca curso sem diferenciar acento nem caixa', async () => {
    expect(await getCourses('COMPUTACAO')).toHaveLength(1)
    expect(await getCourses('computação')).toHaveLength(1)
    expect(await getCourses('arquitetura')).toEqual([])
  })

  it('devolve o curso pelo id e null para curso que não existe', async () => {
    expect(await getCourse(COURSE_ID)).toMatchObject({
      name: 'Engenharia de Computação',
      targetHours: 120,
    })
    expect(await getCourse('7c9e6679-7425-40de-944b-e07fc1f90ae7')).toBeNull()
    expect(await getRuleItems('7c9e6679-7425-40de-944b-e07fc1f90ae7')).toEqual([])
  })

  it('não deixa o aluno gravar nas tabelas de cadastro', async () => {
    const db = createClient()
    const update = await db
      .from('itens_curso')
      .update({ maximo_horas: 999 })
      .eq('curso_id', COURSE_ID)

    const items = await getRuleItems(COURSE_ID)

    expect(update.error).not.toBeNull()
    expect(items).toHaveLength(24) // pré-condição: há o que comparar
    expect(items.every((item) => item.maxHours < 999)).toBe(true)
  })
})
