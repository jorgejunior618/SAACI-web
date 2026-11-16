'use client'

import { GraduationCap } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Button, StateScreen, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'

/**
 * Trocar curso para quem não tem nenhuma atividade registrada.
 *
 * @remarks
 * TODO: a troca de curso sem atividades não faz parte da issue do Perfil. Até a equipe especificar
 * a tela, ela diz que a troca ainda não está pronta e mostra o marcador. O `CourseLockedError` do
 * service continua valendo como trava de quem tem atividades.
 *
 * @example
 * ```tsx
 * if (activities.length === 0) return <Empty />
 * ```
 */
export function Empty(): ReactNode {
  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Trocar curso" backHref="/perfil" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <StateScreen
        variant="empty"
        icon={GraduationCap}
        title="A troca de curso ainda não está pronta"
        description="Você não tem atividades registradas, então o seu curso pode mudar. Essa troca ainda está sendo preparada. [TROCA DE CURSO SEM ATIVIDADES]"
        actions={
          <Button as={NextLink} href="/perfil" variant="secondary" block>
            Voltar ao perfil
          </Button>
        }
      />
    </AppFrame>
  )
}
