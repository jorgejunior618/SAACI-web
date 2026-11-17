'use client'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Card, Link, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

import { DeliverySteps } from '../_components/DeliverySteps'
import * as S from './styles'

/**
 * Tela Como entregar: o passo a passo para entregar o pedido à coordenação no IFCE.
 *
 * @remarks
 * Hoje a entrega é manual: e-mail para o protocolo, ida ao protocolo e acompanhamento por e-mail. A
 * tela só orienta, sem guardar passo feito, e mostra todos os passos abertos. Lê perfil, progresso e
 * curso apenas para deixar o e-mail preenchido, e não soma horas (RNF20). Não tem `Empty`: o guia
 * serve com qualquer estado do pedido. A página envolve este componente em `Suspense`, com
 * `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <ComoEntregar />
 * </Suspense>
 * ```
 */
export function ComoEntregar(): ReactNode {
  const [{ data: profile }, { data: progress }] = useSuspenseQueries({
    queries: [profileQueries.detail(), progressQueries.summary()],
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe.
  if (profile.courseId === null) throw new Error('O Como entregar abriu sem curso no perfil.')

  // Depende do perfil, então espera a busca de cima.
  const { data: course } = useSuspenseQuery(rulesQueries.course(profile.courseId))

  if (course === null) throw new Error(`O curso ${profile.courseId} do perfil não existe.`)

  return (
    <AppFrame
      topBar={
        <TopBar
          variant="inner"
          title="Como entregar"
          backHref="/atividades/pedido"
          linkAs={NextLink}
        />
      }
      bottomNav={<MainNav />}
    >
      <S.Page>
        <S.Header>
          <S.Headline>Entregar na coordenação</S.Headline>
          <S.Lead>
            A entrega começa por e-mail e termina na recepção do IFCE. Siga os passos na ordem.
          </S.Lead>
        </S.Header>

        <Card>
          <DeliverySteps
            variant="full"
            email={{
              name: profile.name,
              enrollmentId: profile.enrollmentId,
              courseName: course.name,
              totalHours: progress.totalHours,
            }}
          />
        </Card>

        <Link as={NextLink} href="/atividades/pedido" isStandalone>
          Voltar ao meu pedido
        </Link>
      </S.Page>
    </AppFrame>
  )
}
