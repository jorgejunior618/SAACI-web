import * as v from 'valibot'

import { simulateLatency } from '@/utils/simulate-latency'

import { readSession } from './account.mock'
import { SessionSchema } from './account.types'
import type { Session } from './account.types'

/**
 * Lê a sessão atual.
 *
 * @returns A sessão, ou `null` quando ninguém está logado.
 */
export async function getSession(): Promise<Session | null> {
  await simulateLatency()
  const session = readSession()

  return session ? v.parse(SessionSchema, session) : null
}
