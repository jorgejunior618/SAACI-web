'use client'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { AppFrame, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { accountQueries } from '@/services/account'
import { profileQueries, updateProfile } from '@/services/profile'
import { rulesQueries } from '@/services/rules'
import { formatSemester, StartSemesterFormSchema } from '@/utils/start-semester'

import { AboutCard } from './_components/AboutCard'
import { CourseCard } from './_components/CourseCard'
import { DeleteAccount } from './_components/DeleteAccount'
import { EditableRow } from './_components/EditableRow'
import { ProfileHeader } from './_components/ProfileHeader'
import { EnrollmentFormSchema } from './schema'
import * as S from './styles'

const NOT_INFORMED = 'Não informada'

/**
 * Tela Perfil: os dados do aluno, o curso, o aviso de privacidade, o Sair e o Apagar conta.
 *
 * @remarks
 * Matrícula e semestre de início se editam na própria linha. Mudar o semestre avisa antes de salvar
 * (RF11) e, como altera o total de horas, derruba o progresso e as atividades pela rotina do
 * domínio. O curso só se mostra: trocar leva a Trocar curso, que explica a trava (RF10). Aparência
 * não entra aqui: a issue deixa a decisão do modo escuro para a equipe. Não há `Empty`: com sessão, o perfil sempre existe, e quem não
 * tem curso é levado a Seu curso pelo `SessionGate`. A página envolve este componente em `Suspense`,
 * com `Loading` como fallback.
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

  // O SessionGate só abre este grupo com sessão e curso. Sem estas checagens, `null` viraria uma
  // busca de curso com id vazio, sem aviso.
  if (session === null) throw new Error('O Perfil abriu sem sessão.')
  if (profile.courseId === null) throw new Error('O Perfil abriu sem curso no perfil.')

  // Depende do perfil, então espera a busca de cima.
  const { data: course } = useSuspenseQuery(rulesQueries.course(profile.courseId))

  if (course === null) throw new Error('O curso do perfil não existe nas regras.')

  const semester = profile.startSemester ? formatSemester(profile.startSemester) : null

  return (
    <AppFrame topBar={<TopBar variant="root" title="Perfil" />} bottomNav={<MainNav />}>
      <S.Page>
        <ProfileHeader name={profile.name} email={session.email} />

        <S.Section>
          <S.SectionTitle>Seus dados</S.SectionTitle>
          <S.DataCard>
            <S.FixedRow>
              <span>E-mail</span>
              <S.FixedValue>{session.email}</S.FixedValue>
            </S.FixedRow>
            <EditableRow
              label="Matrícula"
              displayValue={profile.enrollmentId ?? NOT_INFORMED}
              initialValue={profile.enrollmentId ?? ''}
              schema={EnrollmentFormSchema}
              hint="Vai no formulário da coordenação. Pode deixar em branco."
              inputMode="numeric"
              successMessage="Matrícula salva. Ela já entra no seu formulário."
              clearedMessage="Matrícula removida. O formulário vai sem ela."
              onSave={(enrollmentId) => updateProfile({ enrollmentId })}
            />
            <EditableRow
              label="Semestre de início"
              displayValue={semester ?? NOT_INFORMED}
              initialValue={semester ?? ''}
              schema={StartSemesterFormSchema}
              hint="Digite o ano e o semestre, como 2023.2."
              inputMode="decimal"
              placeholder="2023.2"
              warning="Mudar o semestre muda quais atividades contam e o seu total de horas. Confira antes de salvar."
              successMessage="Semestre salvo. Suas horas foram recalculadas."
              onSave={(startSemester) =>
                updateProfile({ startSemester: startSemester ?? undefined })
              }
            />
          </S.DataCard>
        </S.Section>

        <S.Section>
          <S.SectionTitle>Curso</S.SectionTitle>
          <CourseCard course={course} />
        </S.Section>

        <AboutCard />
        <DeleteAccount />
      </S.Page>
    </AppFrame>
  )
}
