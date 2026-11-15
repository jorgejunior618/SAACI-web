import { describe, expect, it } from 'vitest'

import type { Session } from '@/services/account'
import type { Profile } from '@/services/profile'

import { getSessionRedirect } from './utils'

const session: Session = { email: 'ana.moura07@aluno.ifce.edu.br', emailConfirmed: true }
const withCourse: Profile = {
  name: 'Ana',
  enrollmentId: null,
  startSemester: '2023-07-01',
  courseId: 'engenharia-de-computacao',
}
const withoutCourse: Profile = { ...withCourse, startSemester: null, courseId: null }

describe('getSessionRedirect', () => {
  it.each([
    ['public', null, null, null],
    ['public', session, withoutCourse, '/seu-curso'],
    ['public', session, withCourse, '/inicio'],
    ['private', null, null, '/entrar'],
    ['private', session, withoutCourse, '/seu-curso'],
    ['private', session, withCourse, null],
    ['onboarding', null, null, '/entrar'],
    ['onboarding', session, withoutCourse, null],
    ['onboarding', session, withCourse, '/inicio'],
    ['account', null, null, '/entrar'],
    ['account', session, withoutCourse, null],
    ['account', session, withCourse, null],
  ] as const)('%s, sessão %o, perfil %o leva a %s', (mode, currentSession, profile, expected) => {
    expect(getSessionRedirect(mode, currentSession, profile)).toBe(expected)
  })
})
