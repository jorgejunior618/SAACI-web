'use client'

import type { ReactNode } from 'react'

import { AppFrame, TopBar, TotalProgress } from '@design-system'

import { MainNav } from '@/components/MainNav'

import { FirstSteps } from './_components/FirstSteps'
import * as S from './styles'

type EmptyProps = {
  /** Meta de horas do curso, vinda de `getProgress`. */
  targetHours: number
}

/**
 * Início do primeiro acesso, quando o aluno ainda não registrou nenhuma atividade.
 *
 * @remarks
 * Mostra o total em 0h e o caminho até a meta. Não lista os itens do curso: a orientação é só o
 * passo a passo. Quem decide entrar neste estado é o `Inicio`, quando `progress.categories` vem
 * vazio.
 *
 * @example
 * ```tsx
 * if (progress.categories.length === 0) {
 *   return <Empty targetHours={progress.targetHours} />
 * }
 * ```
 */
export function Empty({ targetHours }: EmptyProps): ReactNode {
  return (
    <AppFrame topBar={<TopBar variant="home" />} bottomNav={<MainNav />}>
      <S.Page>
        <TotalProgress doneHours={0} goalHours={targetHours} />
        <FirstSteps targetHours={targetHours} />
      </S.Page>
    </AppFrame>
  )
}
