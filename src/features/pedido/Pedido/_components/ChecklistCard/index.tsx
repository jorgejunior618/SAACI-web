import { Check, ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { Icon } from '@design-system'

import type { FormCheck } from '../../utils'
import * as S from './styles'

/** Props de {@link ChecklistCard}. */
export type ChecklistCardProps = {
  /** As linhas de `buildChecks`, na ordem em que aparecem. */
  checks: FormCheck[]
}

/**
 * Lista do que o formulário precisa, com o que já está pronto e o que falta.
 *
 * @remarks
 * Cada linha é um link inteiro para onde o aluno resolve: Registrar, Perfil ou Atividades. A linha
 * pronta leva o círculo verde com o check, e a que falta leva o círculo tracejado. O estado também
 * é dito por texto ("Pronto", "Falta") para quem não vê a cor. Só mostra o que recebe: não decide o
 * que falta.
 *
 * @example
 * ```tsx
 * <ChecklistCard checks={buildChecks({ progress, profile, activities })} />
 * ```
 */
export function ChecklistCard({ checks }: ChecklistCardProps): ReactNode {
  return (
    <S.List aria-label="O que o formulário precisa">
      {checks.map((check) => (
        <S.Item key={check.id}>
          <S.Row as={NextLink} href={check.href}>
            <S.Mark
              state={check.isDone ? 'done' : 'todo'}
              role="img"
              aria-label={check.isDone ? 'Pronto' : 'Falta'}
            >
              {check.isDone ? <Icon icon={Check} size="sm" /> : null}
            </S.Mark>
            <S.Text>
              <S.Title>{check.title}</S.Title>
              <S.Description>{check.description}</S.Description>
            </S.Text>
            <S.Action>
              {check.actionLabel}
              <Icon icon={ChevronRight} size="sm" />
            </S.Action>
          </S.Row>
        </S.Item>
      ))}
    </S.List>
  )
}
