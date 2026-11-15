'use client'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { ChevronRight, Lock } from 'lucide-react'
import NextLink from 'next/link'
import { useRef } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, BottomSheet, Button, Icon, Notice, TopBar } from '@design-system'
import type { BottomSheetHandle } from '@design-system'

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
 * atividades, em Atividades, ou apagar a conta e começar de novo. Remover abre um `BottomSheet` que
 * avisa que não há volta e só então leva a Atividades; nada é apagado nesta tela. Sem atividades,
 * mostra o `Empty`. O curso aparece num campo só de leitura com o cadeado à direita, como no
 * protótipo; o `TextField` do design system só aceita ícone à esquerda, então o campo é local. A
 * página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <TrocarCurso />
 * </Suspense>
 * ```
 */
export function TrocarCurso(): ReactNode {
  const removeSheetRef = useRef<BottomSheetHandle>(null)
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
        <S.LockedField>
          <S.LockedLabel>Seu curso</S.LockedLabel>
          <S.LockedBox>
            <span>{course.name}</span>
            <Icon icon={Lock} size="md" />
          </S.LockedBox>
        </S.LockedField>

        <Notice format="block" tone="warning" title="Com atividades lançadas, o curso fica travado">
          Você tem {registered}, e cada curso tem itens e regras diferentes. Para não misturar as
          horas, o SAACI só troca o curso sem atividades.
        </Notice>

        <S.Section>
          <S.SectionTitle>Para trocar, escolha um caminho</S.SectionTitle>
          <S.Paths>
            <S.PathButton type="button" onClick={() => removeSheetRef.current?.open()}>
              <S.PathText>
                <S.PathTitle>Remover as atividades</S.PathTitle>
                <S.PathDetail>{removeDetail}</S.PathDetail>
              </S.PathText>
              <S.Chevron>
                <Icon icon={ChevronRight} size="sm" />
              </S.Chevron>
            </S.PathButton>
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

      <BottomSheet
        ref={removeSheetRef}
        title="Ir remover as atividades?"
        description="Em Atividades, você remove uma por uma. Cada atividade e o comprovante dela saem do SAACI e não voltam. Baixe os comprovantes antes."
        actions={
          <>
            <Button as={NextLink} href="/atividades" block>
              Ir para Atividades
            </Button>
            <Button variant="secondary" block onClick={() => removeSheetRef.current?.close()}>
              Manter meu curso
            </Button>
          </>
        }
      />
    </AppFrame>
  )
}
