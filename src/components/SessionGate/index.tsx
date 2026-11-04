'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useSyncExternalStore } from 'react'

import { LoadingState } from '@design-system'

import { ROUTES } from '@/constants/routes'
import { type Sessao, contaQueries } from '@/services/conta'

export type GateMode = 'visitante' | 'pendente' | 'curso' | 'aluno'

// Para onde vai quem chegou na rota errada para o estado da conta.
export function destinoDaSessao(sessao: Sessao | null): string {
  if (!sessao) return ROUTES.login
  if (!sessao.isEmailConfirmado) return ROUTES.verificacao
  if (!sessao.curso || !sessao.ingresso) return ROUTES.curso
  return ROUTES.painel
}

const PERMITE: Record<GateMode, (sessao: Sessao | null) => boolean> = {
  visitante: (sessao) => sessao === null,
  pendente: (sessao) => sessao !== null && !sessao.isEmailConfirmado,
  curso: (sessao) => sessao !== null && sessao.isEmailConfirmado,
  aluno: (sessao) => destinoDaSessao(sessao) === ROUTES.painel,
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
