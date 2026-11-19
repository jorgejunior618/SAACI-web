import { createClient } from '@supabase/client'
import { beforeAll, describe, expect, it } from 'vitest'

import { confirmEmail, createAccount, signIn, signOut } from '@/services/account'
import {
  ActivityNotFoundError,
  createActivity,
  getActivities,
  getActivity,
  getProofFile,
  getProofUrl,
  InvalidActivityDatesError,
  removeActivity,
  StaleActivityError,
  updateActivity,
} from '@/services/activities'
import type { Activity } from '@/services/activities'
import { CourseLockedError, updateProfile } from '@/services/profile'

import { waitForEmailLink } from './helpers/mailpit'

// Atividades e comprovantes contra o Supabase local: o arquivo sobe para a pasta do aluno, a RPC grava
// a atividade, e nada fica pela metade (RNF24). O aluno B não lê, não corrige e não remove nada de A.
const PASSWORD = 'senhaforte1'
const COURSE_ID = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'
const stamp = Date.now()
const EMAIL_A = `it.atividades.a.${stamp}@aluno.ifce.edu.br`
const EMAIL_B = `it.atividades.b.${stamp}@aluno.ifce.edu.br`
const PROOF_TEXT = '%PDF-1.4 certificado de teste'

let idA = ''

async function createConfirmedAccount(email: string): Promise<void> {
  await createAccount(email, PASSWORD)
  await confirmEmail((await waitForEmailLink(email)).token)
  await signOut()
}

function pdf(name = 'certificado.pdf'): File {
  return new File([PROOF_TEXT], name, { type: 'application/pdf' })
}

/** Arquivos na pasta do aluno logado, para provar o que sobrou no bucket. */
async function listOwnProofs(): Promise<string[]> {
  const { data, error } = await createClient().storage.from('comprovantes').list(idA)

  if (error) throw error
  return data.map((file) => file.name)
}

const NEW_ACTIVITY = {
  name: 'Curso de Git e GitHub',
  itemNumber: 7,
  quantity: 32,
  startDate: '2025-04-07',
  endDate: '2025-05-03',
}

let created: Activity

beforeAll(async () => {
  await createConfirmedAccount(EMAIL_A)
  await createConfirmedAccount(EMAIL_B)
  await signIn(EMAIL_A, PASSWORD)
  idA = (await createClient().auth.getUser()).data.user?.id ?? ''
  await updateProfile({ courseId: COURSE_ID, startSemester: '2023-07-01' })
  created = await createActivity({ ...NEW_ACTIVITY, proof: pdf() })
})

describe('atividades', () => {
  it('registra com o comprovante e devolve a atividade com as horas', async () => {
    await signIn(EMAIL_A, PASSWORD)

    expect(idA).not.toBe('')
    expect(created).toMatchObject({
      name: 'Curso de Git e GitHub',
      countedHours: 8,
      status: 'conta',
      proof: { fileName: 'certificado.pdf', sizeBytes: PROOF_TEXT.length, type: 'pdf' },
    })
    expect(await getActivities()).toEqual([created])
    expect(await listOwnProofs()).toHaveLength(1)
  })

  it('abre o comprovante por URL assinada e baixa o mesmo arquivo', async () => {
    await signIn(EMAIL_A, PASSWORD)

    const url = await getProofUrl(created.id)
    const response = await fetch(url)

    expect(url).toContain('token=')
    expect(response.ok).toBe(true)
    expect(await response.text()).toBe(PROOF_TEXT)
    expect(await (await getProofFile(created.id)).text()).toBe(PROOF_TEXT)
  })

  it('não deixa atividade nem arquivo quando o banco recusa (RNF24)', async () => {
    await signIn(EMAIL_A, PASSWORD)

    await expect(
      createActivity({ ...NEW_ACTIVITY, itemNumber: 999, proof: pdf('item-errado.pdf') }),
    ).rejects.toMatchObject({ code: '23503' })
    expect(await getActivities()).toHaveLength(1)
    expect(await listOwnProofs()).toHaveLength(1)
  })

  it('corrige com o updatedAt lido e recusa a correção sobre versão velha', async () => {
    await signIn(EMAIL_A, PASSWORD)

    const corrected = await updateActivity(created.id, created.updatedAt, { quantity: 40 })

    expect(corrected).toMatchObject({ quantity: 40, countedHours: 10 })
    expect(corrected.updatedAt).not.toBe(created.updatedAt)
    await expect(
      updateActivity(created.id, created.updatedAt, { name: 'Outro' }),
    ).rejects.toBeInstanceOf(StaleActivityError)
    created = corrected
  })

  it('recusa corrigir só o fim para antes do início que ficou', async () => {
    await signIn(EMAIL_A, PASSWORD)

    await expect(
      updateActivity(created.id, created.updatedAt, { endDate: '2020-01-01' }),
    ).rejects.toBeInstanceOf(InvalidActivityDatesError)
  })

  it('com atividade registrada, o curso fica travado (RF10)', async () => {
    await signIn(EMAIL_A, PASSWORD)

    // Só há um curso cadastrado. O gatilho de RF10 roda antes da FK, então qualquer outro id prova a trava.
    await expect(
      updateProfile({ courseId: '00000000-0000-4000-8000-0000000000ff' }),
    ).rejects.toBeInstanceOf(CourseLockedError)
  })
})

describe('isolamento entre alunos', () => {
  it('o aluno B não lê, não corrige e não remove a atividade de A', async () => {
    await signIn(EMAIL_B, PASSWORD)

    expect(await getActivities()).toEqual([])
    expect(await getActivity(created.id)).toBeNull()
    await expect(getProofUrl(created.id)).rejects.toBeInstanceOf(ActivityNotFoundError)
    await expect(getProofFile(created.id)).rejects.toBeInstanceOf(ActivityNotFoundError)
    await expect(
      updateActivity(created.id, created.updatedAt, { name: 'Invadido' }),
    ).rejects.toBeInstanceOf(ActivityNotFoundError)
    await expect(removeActivity(created.id)).rejects.toBeInstanceOf(ActivityNotFoundError)

    // A atividade e o arquivo de A ficaram intactos.
    await signIn(EMAIL_A, PASSWORD)
    expect(await getActivity(created.id)).toMatchObject({ name: 'Curso de Git e GitHub' })
    expect(await listOwnProofs()).toHaveLength(1)
  })

  it('o aluno B não baixa o arquivo de A direto do bucket', async () => {
    await signIn(EMAIL_A, PASSWORD)
    const [fileName] = await listOwnProofs()

    expect(fileName).toBeDefined()
    await signIn(EMAIL_B, PASSWORD)

    const { data, error } = await createClient()
      .storage.from('comprovantes')
      .download(`${idA}/${fileName ?? ''}`)

    expect(data).toBeNull()
    expect(error).not.toBeNull()
  })
})

describe('remover', () => {
  it('apaga a atividade e o comprovante', async () => {
    await signIn(EMAIL_A, PASSWORD)

    await removeActivity(created.id)

    expect(await getActivity(created.id)).toBeNull()
    expect(await getActivities()).toEqual([])
    expect(await listOwnProofs()).toEqual([])
  })
})
