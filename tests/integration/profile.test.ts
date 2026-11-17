import { createClient } from '@supabase/client'
import { beforeAll, describe, expect, it } from 'vitest'

import { confirmEmail, createAccount, signIn, signOut } from '@/services/account'
import { getProfile, updateProfile } from '@/services/profile'

import { waitForEmailLink } from './helpers/mailpit'

// Perfil contra o Supabase local: o gatilho cria a linha no cadastro, o aluno só lê e muda a própria,
// e o banco recusa semestre fora de 1º de janeiro ou de julho. A trava de troca de curso (RF10) é
// provada no pgTAP, porque só há um curso cadastrado e a tabela de atividades ainda não existe.
// TODO [#20]: com atividades reais, acrescentar aqui o caso de `CourseLockedError` pelo service. O
// caminho PostgREST até `SA010` foi conferido à mão (stub `true` e 2º curso), sem teste permanente,
// porque a suíte não tem como trocar a função do banco.
const PASSWORD = 'senhaforte1'
const COURSE_ID = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'
const stamp = Date.now()
const EMAIL_A = `it.perfil.a.${stamp}@aluno.ifce.edu.br`
const EMAIL_B = `it.perfil.b.${stamp}@aluno.ifce.edu.br`

let idA = ''

async function createConfirmedAccount(email: string): Promise<void> {
  await createAccount(email, PASSWORD)
  await confirmEmail((await waitForEmailLink(email)).token)
  await signOut()
}

beforeAll(async () => {
  await createConfirmedAccount(EMAIL_A)
  await createConfirmedAccount(EMAIL_B)
  await signIn(EMAIL_A, PASSWORD)
  idA = (await createClient().auth.getUser()).data.user?.id ?? ''
  await signOut()
})

describe('perfil', () => {
  it('nasce vazio no cadastro, criado pelo gatilho', async () => {
    await signIn(EMAIL_A, PASSWORD)

    expect(idA).not.toBe('')
    expect(await getProfile()).toEqual({
      name: null,
      enrollmentId: null,
      startSemester: null,
      courseId: null,
    })
  })

  it('grava só os campos enviados e devolve o perfil inteiro', async () => {
    await signIn(EMAIL_A, PASSWORD)

    const saved = await updateProfile({
      name: 'Ana Beatriz Moura',
      enrollmentId: '2023104501',
      startSemester: '2023-07-01',
      courseId: COURSE_ID,
    })

    expect(saved).toEqual({
      name: 'Ana Beatriz Moura',
      enrollmentId: '2023104501',
      startSemester: '2023-07-01',
      courseId: COURSE_ID,
    })
    expect(await updateProfile({ enrollmentId: null })).toMatchObject({
      enrollmentId: null,
      name: 'Ana Beatriz Moura',
      courseId: COURSE_ID,
    })
    expect(await getProfile()).toMatchObject({ enrollmentId: null, startSemester: '2023-07-01' })
  })

  it('aceita regravar o mesmo curso', async () => {
    await signIn(EMAIL_A, PASSWORD)

    await expect(updateProfile({ courseId: COURSE_ID })).resolves.toMatchObject({
      courseId: COURSE_ID,
    })
  })

  it('recusa no banco semestre que não começa em 1º de janeiro ou de julho', async () => {
    await signIn(EMAIL_A, PASSWORD)

    // O service já barra pelo schema, então a prova do `check` vai direto ao banco.
    const { error } = await createClient()
      .from('perfis')
      .update({ semestre_inicio: '2023-03-15' })
      .eq('aluno_id', idA)

    expect(error?.code).toBe('23514')
    expect((await getProfile()).startSemester).toBe('2023-07-01')
  })
})

describe('isolamento entre alunos', () => {
  it('o aluno B enxerga só o próprio perfil, vazio', async () => {
    await signIn(EMAIL_B, PASSWORD)

    const { data, error } = await createClient().from('perfis').select('aluno_id')

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.aluno_id).not.toBe(idA)
    expect(await getProfile()).toMatchObject({ name: null, courseId: null })
  })

  it('o aluno B não lê o perfil de A pelo id', async () => {
    // Pré-condição: o perfil de A existe e tem dado, senão `[]` passaria sobre nada.
    await signIn(EMAIL_A, PASSWORD)
    expect(await getProfile()).toMatchObject({ name: 'Ana Beatriz Moura' })
    await signIn(EMAIL_B, PASSWORD)

    const { data, error } = await createClient().from('perfis').select('nome').eq('aluno_id', idA)

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('o aluno B não muda o perfil de A, e o perfil de A fica intacto', async () => {
    await signIn(EMAIL_B, PASSWORD)

    const { data, error } = await createClient()
      .from('perfis')
      .update({ matricula: 'invadida', nome: 'Invasor' })
      .eq('aluno_id', idA)
      .select()

    expect(error).toBeNull()
    expect(data).toEqual([])

    await signIn(EMAIL_A, PASSWORD)
    expect(await getProfile()).toMatchObject({ name: 'Ana Beatriz Moura', enrollmentId: null })
  })

  it('o aluno B não toma a linha de A trocando o próprio dono', async () => {
    await signIn(EMAIL_B, PASSWORD)

    const { error } = await createClient()
      .from('perfis')
      .update({ aluno_id: idA })
      .neq('aluno_id', idA)

    expect(error?.code).toBe('42501')
  })

  it('o aluno não cria nem apaga perfil pela API', async () => {
    await signIn(EMAIL_B, PASSWORD)

    const db = createClient()
    const insert = await db.from('perfis').insert({ aluno_id: idA })
    const remove = await db.from('perfis').delete().eq('aluno_id', idA)

    expect(insert.error?.code).toBe('42501')
    expect(remove.error?.code).toBe('42501')

    await signIn(EMAIL_A, PASSWORD)
    expect(await getProfile()).toMatchObject({ name: 'Ana Beatriz Moura' })
  })
})
