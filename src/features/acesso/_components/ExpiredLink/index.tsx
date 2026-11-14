'use client'

import { Clock } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Button, StateScreen } from '@design-system'

/**
 * Tela de link vencido, para as telas de Acesso que abrem por link de e-mail.
 *
 * @remarks
 * Diz o que fazer a seguir: pedir um link novo ou voltar para Entrar. Subiu para
 * `features/acesso/_components/` quando Confirme seu e-mail e Nova senha passaram a usá-lo (ADR 0005).
 *
 * @example
 * ```tsx
 * <ExpiredLink />
 * ```
 */
export function ExpiredLink(): ReactNode {
  return (
    <StateScreen
      variant="empty"
      icon={Clock}
      title="Este link não vale mais"
      description="Links de e-mail duram pouco tempo e só funcionam uma vez. Peça um novo e use o mais recente."
      actions={
        <>
          <Button as={NextLink} href="/recuperar-senha" block>
            Pedir um novo link
          </Button>
          <Button as={NextLink} href="/entrar" variant="secondary" block>
            Voltar para Entrar
          </Button>
        </>
      }
    />
  )
}
