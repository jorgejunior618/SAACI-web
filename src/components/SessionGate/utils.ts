import type { Session } from '@/services/account'
import type { Profile } from '@/services/profile'

import type { SessionGateMode } from './index'

/**
 * Diz para onde levar a pessoa, dado o grupo de rota, a sessão e o perfil.
 *
 * @param mode Para quem o grupo de rota existe.
 * @param session Sessão atual, ou `null` sem login.
 * @param profile Perfil do aluno, ou `null` enquanto não há sessão. Com sessão, "sem curso" é
 * `courseId` nulo.
 * @returns A rota de destino, ou `null` quando a pessoa já está no grupo certo.
 */
export function getSessionRedirect(
  mode: SessionGateMode,
  session: Session | null,
  profile: Profile | null,
): string | null {
  if (!session) return mode === 'public' ? null : '/entrar'

  const hasCourse = profile?.courseId != null

  if (mode === 'onboarding') return hasCourse ? '/inicio' : null
  if (!hasCourse) return '/seu-curso'
  return mode === 'public' ? '/inicio' : null
}
