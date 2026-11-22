import { beforeEach, describe, expect, it, vi } from 'vitest'

import { accountQueries } from '@/services/account'
import { activitiesQueries } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

// O prefetch das páginas roda no servidor e precisa passar o cliente do servidor a toda query. Se uma
// definição esquecer o `db`, o service cai no cliente do navegador, que não enxerga o cookie de
// sessão: a busca volta vazia, sem erro. Este teste vigia a fronteira de cada domínio.
const api = vi.hoisted(() => ({
  getSession: vi.fn(),
  getProfile: vi.fn(),
  getProgress: vi.fn(),
  getActivities: vi.fn(),
  getActivity: vi.fn(),
  getCourses: vi.fn(),
  getCourse: vi.fn(),
  getRuleItems: vi.fn(),
}))

vi.mock('@supabase/client', () => ({ createClient: vi.fn() }))
vi.mock('@/services/account/account.api', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getSession: api.getSession,
}))
vi.mock('@/services/profile/profile.api', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getProfile: api.getProfile,
}))
vi.mock('@/services/progress/progress.api', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getProgress: api.getProgress,
}))
vi.mock('@/services/activities/activities.api', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getActivities: api.getActivities,
  getActivity: api.getActivity,
}))
vi.mock('@/services/rules/rules.api', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getCourses: api.getCourses,
  getCourse: api.getCourse,
  getRuleItems: api.getRuleItems,
}))

const db = { servidor: true } as never

/** Roda o `queryFn` da definição, como o React Query faz, com um contexto vazio. */
async function run(definition: { queryFn?: unknown }): Promise<void> {
  await (definition.queryFn as (context: object) => Promise<unknown>)({})
}

const cases: Array<[string, (db?: never) => { queryFn?: unknown }, () => unknown, unknown[]]> = [
  ['account.session', (d) => accountQueries.session(d), () => api.getSession, []],
  ['profile.detail', (d) => profileQueries.detail(d), () => api.getProfile, []],
  ['progress.summary', (d) => progressQueries.summary(d), () => api.getProgress, []],
  ['activities.list', (d) => activitiesQueries.list(d), () => api.getActivities, []],
  ['activities.detail', (d) => activitiesQueries.detail('a1', d), () => api.getActivity, ['a1']],
  ['rules.courses', (d) => rulesQueries.courses('eng', d), () => api.getCourses, ['eng']],
  ['rules.course', (d) => rulesQueries.course('c1', d), () => api.getCourse, ['c1']],
  ['rules.items', (d) => rulesQueries.items('c1', d), () => api.getRuleItems, ['c1']],
]

describe('definições de query aceitam o db do servidor', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset())
  })

  it.each(cases)('%s repassa o db ao service', async (_name, build, getFn, args) => {
    await run(build(db))

    expect(getFn()).toHaveBeenCalledWith(...args, db)
  })

  it.each(cases)(
    '%s sem db deixa o service usar o cliente do navegador',
    async (_n, build, getFn, args) => {
      await run(build())

      expect(getFn()).toHaveBeenCalledWith(...args, undefined)
    },
  )

  it('o db não entra na chave: a chave do servidor e a do navegador precisam ser a mesma', () => {
    expect(profileQueries.detail(db).queryKey).toEqual(profileQueries.detail().queryKey)
    expect(accountQueries.session(db).queryKey).toEqual(accountQueries.session().queryKey)
    expect(rulesQueries.items('c1', db).queryKey).toEqual(rulesQueries.items('c1').queryKey)
  })
})
