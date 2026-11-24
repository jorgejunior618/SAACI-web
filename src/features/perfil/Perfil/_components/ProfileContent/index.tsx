// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { AppFrame, TopBar } from '@design-system'

import { MainNav } from '@/components/MainNav'
import { updateProfile } from '@/services/profile'
import type { Profile } from '@/services/profile'
import { rulesQueries } from '@/services/rules'
import { formatSemester, StartSemesterFormSchema } from '@/utils/start-semester'

import { EnrollmentFormSchema, NameFormSchema } from '../../schema'
import { AboutCard } from '../AboutCard'
import { CourseCard } from '../CourseCard'
import { DeleteAccount } from '../DeleteAccount'
import { EditableRow } from '../EditableRow'
import { ProfileHeader } from '../ProfileHeader'
import * as S from './styles'

const NAME_NOT_INFORMED = 'Não informado'
const ENROLLMENT_NOT_INFORMED = 'Não informada'
const SEMESTER_NOT_INFORMED = 'Não informado'

export type ProfileContentProps = {
  /** Perfil do aluno, já com curso escolhido. */
  profile: Profile
  /** Id do curso do perfil. Vem separado porque `profile.courseId` é anulável e aqui nunca é. */
  courseId: string
  /** E-mail da conta, que vem da sessão e não do perfil. */
  email: string
}

/**
 * Corpo do Perfil de quem já escolheu o curso: dados, curso, aviso de privacidade, Sair e Apagar
 * conta.
 *
 * @remarks
 * Nome, matrícula e semestre de início se editam na própria linha. O nome vai no formulário da
 * coordenação, e a tela Seu pedido leva até aqui quando ele falta. Mudar o semestre avisa antes de salvar
 * (RF11) e, como altera o total de horas, derruba o progresso e as atividades pela rotina do
 * domínio. O curso só se mostra: trocar leva a Trocar curso, que explica a trava (RF10). Aparência
 * não entra aqui: a issue deixa a decisão do modo escuro para a equipe. Existe separado do `Perfil`
 * porque a busca do curso depende do `courseId`, e hook não pode ficar depois de um retorno
 * condicional. Precisa de um `Suspense` acima.
 *
 * @example
 * ```tsx
 * <ProfileContent profile={profile} courseId={profile.courseId} email={session.email} />
 * ```
 */
export function ProfileContent({ profile, courseId, email }: ProfileContentProps): ReactNode {
  const { data: course } = useSuspenseQuery(rulesQueries.course(courseId))

  // O curso do perfil sempre existe nas regras. Sem esta checagem, `null` viraria um cartão vazio.
  if (course === null) throw new Error('O curso do perfil não existe nas regras.')

  const semester = profile.startSemester ? formatSemester(profile.startSemester) : null

  return (
    <AppFrame topBar={<TopBar variant="root" title="Perfil" />} bottomNav={<MainNav />}>
      <S.Page>
        <ProfileHeader name={profile.name} email={email} />

        <S.Section>
          <S.SectionTitle>Seus dados</S.SectionTitle>
          <S.DataCard>
            <S.FixedRow>
              <span>E-mail</span>
              <S.FixedValue>{email}</S.FixedValue>
            </S.FixedRow>
            <EditableRow
              label="Nome"
              displayValue={profile.name ?? NAME_NOT_INFORMED}
              initialValue={profile.name ?? ''}
              schema={NameFormSchema}
              hint="Como está nos seus documentos. Vai no formulário da coordenação."
              successMessage="Nome salvo. Ele já entra no seu formulário."
              onSave={async (name) => {
                // O schema do nome nunca devolve `null`. Se devolvesse, gravar `{}` mostraria "salvo"
                // sem salvar, então a falha aparece como erro de envio.
                if (name === null) throw new Error('O nome não pode ficar vazio.')

                return updateProfile({ name })
              }}
            />
            <EditableRow
              label="Matrícula"
              displayValue={profile.enrollmentId ?? ENROLLMENT_NOT_INFORMED}
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
              displayValue={semester ?? SEMESTER_NOT_INFORMED}
              initialValue={semester ?? ''}
              schema={StartSemesterFormSchema}
              hint="Digite o ano e o semestre, como 2023.2."
              inputMode="decimal"
              placeholder="2023.2"
              warning="Mudar o semestre muda quais atividades contam e o seu total de horas. Confira antes de salvar."
              successMessage="Semestre salvo. Suas horas foram recalculadas."
              onSave={async (startSemester) => {
                // O schema do semestre nunca devolve `null`. Se devolvesse, gravar `{}` mostraria
                // "salvo" sem salvar, então a falha aparece como erro de envio.
                if (startSemester === null)
                  throw new Error('O semestre de início não pode ficar vazio.')

                return updateProfile({ startSemester })
              }}
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
