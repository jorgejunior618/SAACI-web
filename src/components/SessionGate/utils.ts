import type { Session } from '@/services/account'
import type { Profile } from '@/services/profile'

/**
 * Para quem um grupo de rota existe: só quem tem sessão e curso, só quem não tem sessão, quem
 * ainda escolhe o curso, ou qualquer pessoa com sessão, tenha curso ou não (`account`).
 */
export type SessionGateMode = 'private' | 'public' | 'onboarding' | 'account'

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
  if (mode === 'account') return null

  const hasCourse = profile?.courseId != null

  if (mode === 'onboarding') return hasCourse ? '/inicio' : null
  if (!hasCourse) return '/seu-curso'
  return mode === 'public' ? '/inicio' : null
}
