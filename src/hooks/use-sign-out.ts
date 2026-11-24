// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { clearSessionCache, signOut } from '@/services/account'

/**
 * Mutation de Sair: encerra a sessão, esvazia o cache e leva para Entrar.
 *
 * @remarks
 * O cache é esvaziado antes de navegar, para nenhum dado do aluno ficar na memória quando outra conta
 * entrar no mesmo navegador (RNF04). Se `signOut` falhar, a pessoa continua na tela e quem usa o hook
 * mostra a frase de erro a partir de `isError`. Existe para as telas Seu curso e Perfil dividirem a
 * regra e mudarem só o desenho.
 *
 * @returns A mutation do TanStack Query. Chame `mutate()` para sair.
 *
 * @example
 * ```tsx
 * const signOutMutation = useSignOut()
 *
 * <button type="button" onClick={() => signOutMutation.mutate()}>Sair</button>
 * ```
 */
export function useSignOut(): UseMutationResult<void, Error, void> {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      clearSessionCache(queryClient)
      router.replace('/entrar')
    },
  })
}
