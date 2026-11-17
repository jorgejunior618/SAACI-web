import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProfile } from './profile.api'
import { CourseLockedError } from './profile.errors'
import { updateProfile } from './profile.mutations'

const USER_ID = '00000000-0000-4000-8000-0000000000a1'
const COURSE_ID = '3b1f6d2e-5a47-4c80-9e1b-7d0c2a4f8e11'

const PROFILE_ROW = {
  nome: 'Ana Beatriz Moura',
  matricula: '2023104501',
  semestre_inicio: '2023-07-01',
  curso_id: COURSE_ID,
}

const maybeSingle = vi.fn()
const eq = vi.fn()
const select = vi.fn()
const update = vi.fn()
const from = vi.fn()
const getUser = vi.fn()

// Só o navegador cria cliente; o mock devolve sempre o mesmo, com o construtor de query falso.
vi.mock('@supabase/client', () => ({ createClient: () => ({ from, auth: { getUser } }) }))

beforeEach(() => {
  vi.resetAllMocks()

  const builder = { select, update, eq, maybeSingle }

  from.mockReturnValue(builder)
  select.mockReturnValue(builder)
  update.mockReturnValue(builder)
  eq.mockReturnValue(builder)
  getUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null })
})

describe('getProfile', () => {
  it('traduz a row do banco para o tipo de domínio', async () => {
    maybeSingle.mockResolvedValue({ data: PROFILE_ROW, error: null })

    expect(await getProfile()).toEqual({
      name: 'Ana Beatriz Moura',
      enrollmentId: '2023104501',
      startSemester: '2023-07-01',
      courseId: COURSE_ID,
    })
    expect(from).toHaveBeenCalledWith('perfis')
    expect(select).toHaveBeenCalledWith('nome, matricula, semestre_inicio, curso_id')
  })

  it('devolve curso e semestre nulos para a conta recém-criada', async () => {
    maybeSingle.mockResolvedValue({
      data: { nome: null, matricula: null, semestre_inicio: null, curso_id: null },
      error: null,
    })

    expect(await getProfile()).toEqual({
      name: null,
      enrollmentId: null,
      startSemester: null,
      courseId: null,
    })
  })

  it('lança erro quando não há perfil, como acontece sem sessão', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })

    await expect(getProfile()).rejects.toThrow('Entre de novo')
  })

  it('repassa o erro do banco sem traduzir', async () => {
    const failure = new Error('falha de rede')

    maybeSingle.mockResolvedValue({ data: null, error: failure })

    await expect(getProfile()).rejects.toBe(failure)
  })

  it('recusa a row com semestre que não começa em 1º de janeiro ou de julho', async () => {
    maybeSingle.mockResolvedValue({
      data: { ...PROFILE_ROW, semestre_inicio: '2023-03-15' },
      error: null,
    })

    await expect(getProfile()).rejects.toThrow()
  })
})

describe('updateProfile', () => {
  it('grava só os campos enviados, nas colunas do banco, e devolve o perfil inteiro', async () => {
    maybeSingle.mockResolvedValue({
      data: { ...PROFILE_ROW, matricula: '2023999999' },
      error: null,
    })

    const profile = await updateProfile({ enrollmentId: '2023999999' })

    expect(update).toHaveBeenCalledWith({ matricula: '2023999999' })
    expect(eq).toHaveBeenCalledWith('aluno_id', USER_ID)
    expect(profile).toMatchObject({ enrollmentId: '2023999999', name: 'Ana Beatriz Moura' })
  })

  it('apaga a matrícula com null', async () => {
    maybeSingle.mockResolvedValue({ data: { ...PROFILE_ROW, matricula: null }, error: null })

    expect((await updateProfile({ enrollmentId: null })).enrollmentId).toBeNull()
    expect(update).toHaveBeenCalledWith({ matricula: null })
  })

  it('traduz curso e semestre juntos, como a tela Seu curso envia', async () => {
    maybeSingle.mockResolvedValue({ data: PROFILE_ROW, error: null })

    await updateProfile({ courseId: COURSE_ID, startSemester: '2023-07-01' })

    expect(update).toHaveBeenCalledWith({ curso_id: COURSE_ID, semestre_inicio: '2023-07-01' })
  })

  it('recusa semestre que não começa em 1º de janeiro ou de julho, sem chamar o banco', async () => {
    await expect(updateProfile({ startSemester: '2023-03-15' })).rejects.toThrow()

    expect(from).not.toHaveBeenCalled()
  })

  it('sem campo a gravar, devolve o perfil atual sem fazer update', async () => {
    maybeSingle.mockResolvedValue({ data: PROFILE_ROW, error: null })

    expect(await updateProfile({})).toMatchObject({ courseId: COURSE_ID })
    expect(update).not.toHaveBeenCalled()
  })

  it('lança erro quando não há sessão', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(updateProfile({ enrollmentId: '1' })).rejects.toThrow('Entre de novo')
    expect(update).not.toHaveBeenCalled()
  })

  it('traduz o SQLSTATE SA010 do banco para CourseLockedError (RF10)', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { code: 'SA010', message: 'Com atividades registradas, o curso fica travado.' },
    })

    await expect(updateProfile({ courseId: COURSE_ID })).rejects.toBeInstanceOf(CourseLockedError)
  })

  it('repassa o erro desconhecido sem traduzir', async () => {
    const failure = Object.assign(new Error('falha de rede'), { code: '08006' })

    maybeSingle.mockResolvedValue({ data: null, error: failure })

    await expect(updateProfile({ courseId: COURSE_ID })).rejects.toBe(failure)
  })

  it('lança erro quando o update não alcança nenhuma linha', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })

    await expect(updateProfile({ enrollmentId: '1' })).rejects.toThrow('Entre de novo')
  })
})
