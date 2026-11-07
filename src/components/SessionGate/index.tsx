'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useSyncExternalStore } from 'react'

import { LoadingState } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { contaQueries, type Sessao } from '@/services/conta'

export type GateMode = 'visitante' | 'aluno'

// Para onde vai quem chegou na rota errada para o estado da sessão.
export function destinoDaSessao(sessao: Sessao | null): string {
  return sessao ? ROUTES.inicio : ROUTES.login
}

const PERMITE: Record<GateMode, (sessao: Sessao | null) => boolean> = {
  visitante: (sessao) => sessao === null,
  aluno: (sessao) => sessao !== null,
}

const noop = (): (() => void) => () => undefined

type Props = {
  mode: GateMode
  children: ReactNode
}

// Enquanto não há backend, a sessão mora no navegador: nada da área logada renderiza no servidor.
export function SessionGate({ mode, children }: Props): ReactNode {
  const router = useRouter()
  const isMounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  // useQuery e não useSuspenseQuery: a busca só pode rodar depois de montar no navegador.
  const { data: sessao, isSuccess } = useQuery({ ...contaQueries.sessao(), enabled: isMounted })
  const isAllowed = isSuccess && PERMITE[mode](sessao)

  useEffect(() => {
    if (isSuccess && !PERMITE[mode](sessao)) router.replace(destinoDaSessao(sessao))
  }, [isSuccess, mode, router, sessao])

  return isAllowed ? children : <LoadingState />
}
