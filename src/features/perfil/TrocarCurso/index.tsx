'use client'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight, Lock } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { AppFrame, Icon, Notice, TextField, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { activitiesQueries } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { rulesQueries } from '@/services/rules'

import { Empty } from './Empty'
import * as S from './styles'

/**
 * Tela Trocar curso: explica por que o curso está travado e mostra os dois caminhos para trocá-lo.
 *
 * @remarks
 * Com atividades registradas o curso não muda (RF10). A tela conta as atividades em vez de esperar o
 * `CourseLockedError`, que segue como trava do service e do banco. Os caminhos são remover as
 * atividades, em Atividades, ou apagar a conta e começar de novo. Sem atividades, mostra o `Empty`.
 * A página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <TrocarCurso />
 * </Suspense>
 * ```
 */
export function TrocarCurso(): ReactNode {
  const [{ data: profile }, { data: activities }] = useSuspenseQueries({
    queries: [profileQueries.detail(), activitiesQueries.list()],
  })

  // O SessionGate só abre este grupo com curso. Sem esta checagem, `null` viraria uma busca com id
  // vazio, sem aviso.
  if (profile.courseId === null) throw new Error('Trocar curso abriu sem curso no perfil.')

  // Depende do perfil, então espera a busca de cima.
  const { data: course } = useSuspenseQuery(rulesQueries.course(profile.courseId))

  if (course === null) throw new Error('O curso do perfil não existe nas regras.')
  if (activities.length === 0) return <Empty />

  const total = activities.length
  const registered = total === 1 ? '1 atividade registrada' : `${total} atividades registradas`
  const removeDetail =
    total === 1
      ? 'Baixe o comprovante antes, remova a atividade em Atividades e volte aqui.'
      : `Baixe os comprovantes antes, remova as ${total} em Atividades e volte aqui.`

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Trocar curso" backHref="/perfil" linkAs={NextLink} />}
      bottomNav={<MainNav />}
    >
      <S.Page>
        <TextField label="Seu curso" icon={Lock} value={course.name} readOnly />

        <Notice format="block" tone="warning" title="Com atividades lançadas, o curso fica travado">
          Você tem {registered}, e cada curso tem itens e regras diferentes. Para não misturar as
          horas, o SAACI só troca o curso sem atividades.
        </Notice>

        <S.Section>
          <S.SectionTitle>Para trocar, escolha um caminho</S.SectionTitle>
          <S.Paths>
            <S.Path as={NextLink} href="/atividades">
              <S.PathText>
                <S.PathTitle>Remover as atividades</S.PathTitle>
                <S.PathDetail>{removeDetail}</S.PathDetail>
              </S.PathText>
              <S.Chevron>
                <Icon icon={ChevronRight} size="sm" />
              </S.Chevron>
            </S.Path>
            <S.Path as={NextLink} href="/excluir-conta">
              <S.PathText>
                <S.PathTitle>Apagar a conta e começar de novo</S.PathTitle>
                <S.PathDetail>
                  Crie a conta outra vez com o mesmo e-mail e escolha o curso novo.
                </S.PathDetail>
              </S.PathText>
              <S.Chevron>
                <Icon icon={ChevronRight} size="sm" />
              </S.Chevron>
            </S.Path>
          </S.Paths>
        </S.Section>

        <S.Footnote>
          Se você mudou de curso no IFCE, as atividades do curso antigo podem não valer no novo.
          Confira com a coordenação.
        </S.Footnote>
      </S.Page>
    </AppFrame>
  )
}
