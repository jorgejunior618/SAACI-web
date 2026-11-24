// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useSuspenseQueries } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { accountQueries } from '@/services/account'
import { profileQueries } from '@/services/profile'

import { ProfileContent } from './_components/ProfileContent'
import { Empty } from './Empty'

/**
 * Tela Perfil: os dados do aluno, o curso, o aviso de privacidade, o Sair e o Apagar conta.
 *
 * @remarks
 * Lê o perfil e a sessão juntos e decide entre o `Empty`, para quem ainda não escolheu o curso, e o
 * `ProfileContent`. O `SessionGate` do grupo `(aluno)` já leva quem não tem curso para Seu curso, então
 * o `Empty` é a rede de segurança de uma corrida entre a navegação e o gate. A página envolve este
 * componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Perfil />
 * </Suspense>
 * ```
 */
export function Perfil(): ReactNode {
  const [{ data: profile }, { data: session }] = useSuspenseQueries({
    queries: [profileQueries.detail(), accountQueries.session()],
  })

  // O grupo `(aluno)` só abre com sessão. Sem esta checagem, `null` viraria um e-mail vazio na tela.
  if (session === null) throw new Error('O Perfil abriu sem sessão.')
  if (profile.courseId === null) return <Empty />

  return <ProfileContent profile={profile} courseId={profile.courseId} email={session.email} />
}
