// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { GraduationCap } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Perfil de quem ainda não escolheu o curso.
 *
 * @remarks
 * O perfil existe, mas sem curso não há meta nem regras para mostrar. A tela diz isso e leva a Seu
 * curso. Quem decide entrar neste estado é o `Perfil`, quando `courseId` vem nulo.
 *
 * @example
 * ```tsx
 * if (profile.courseId === null) return <Empty />
 * ```
 */
export function Empty(): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="root" title="Perfil" />} bottomNav={<MainNav />}>
      <StateScreen
        variant="empty"
        icon={GraduationCap}
        title="Falta escolher o seu curso"
        description="O Perfil mostra seus dados e a meta de horas depois que você escolhe o curso."
        actions={
          <Button as={NextLink} href="/seu-curso" block>
            Escolher meu curso
          </Button>
        }
      />
    </AppFrame>
  )
}
