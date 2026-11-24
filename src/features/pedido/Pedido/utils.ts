// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import type { Activity } from '@/services/activities'
import type { Profile } from '@/services/profile'
import type { Progress } from '@/services/progress'
import type { FormRow } from '@/utils/coordination-form'
import { formatHours } from '@/utils/format-hours'
import { isCounting } from '@/utils/is-counting'

/** Uma linha da lista "O que o formulário precisa". */
export type FormCheck = {
  id: 'goal' | 'name' | 'enrollment' | 'proofs'
  /** `true` quando o item já está pronto para o formulário. */
  isDone: boolean
  title: string
  description: string
  /** Texto do atalho à direita da linha ("Registrar", "Trocar"). */
  actionLabel: string
  /** Para onde o atalho leva. */
  href: string
}

/** Dados de {@link buildChecks}. */
export type BuildChecksInput = {
  progress: Progress
  profile: Profile
  activities: Activity[]
}

/**
 * Conta os comprovantes que contam no total, inteiros ou em parte.
 *
 * @remarks
 * Lê o `status` que o cálculo único devolveu, pelo mesmo `isCounting` de Atividades: não decide o
 * que conta.
 *
 * @param activities Atividades do aluno.
 * @returns Quantos comprovantes entram no pedido.
 */
export function countProofs(activities: Activity[]): number {
  return activities.filter(isCounting).length
}

/**
 * Monta a lista do que o formulário precisa: meta, nome, matrícula e comprovantes.
 *
 * @remarks
 * Não soma horas: usa `totalHours`, `targetHours` e `missingHours` do progresso (RNF20). O nome e a
 * matrícula só contam quando têm texto, então espaço em branco não vale. A linha dos comprovantes
 * fica pronta com pelo menos um comprovante que conta. Nome e matrícula levam ao Perfil, onde se
 * edita.
 *
 * @param input Progresso, perfil e atividades do aluno.
 * @returns As quatro linhas, sempre na ordem meta, nome, matrícula e comprovantes.
 */
export function buildChecks({ progress, profile, activities }: BuildChecksInput): FormCheck[] {
  const name = profile.name?.trim() ?? ''
  const enrollmentId = profile.enrollmentId?.trim() ?? ''
  const proofCount = countProofs(activities)
  const isGoalDone = progress.missingHours === 0

  return [
    isGoalDone
      ? {
          id: 'goal',
          isDone: true,
          title: `${formatHours(progress.targetHours, { fractionDigits: 0 })} completas`,
          description: 'A carga do seu curso',
          actionLabel: 'Ver',
          href: '/inicio',
        }
      : {
          id: 'goal',
          isDone: false,
          title: `Faltam ${formatHours(progress.missingHours, { fractionDigits: 'auto' })} para a meta de ${formatHours(progress.targetHours, { fractionDigits: 0 })}`,
          description: `Você tem ${formatHours(progress.totalHours, { fractionDigits: 0 })}. Registre mais atividades.`,
          actionLabel: 'Registrar',
          href: '/registrar',
        },
    name
      ? {
          id: 'name',
          isDone: true,
          title: name,
          description: 'Nome no formulário',
          actionLabel: 'Trocar',
          href: '/perfil',
        }
      : {
          id: 'name',
          isDone: false,
          title: 'Seu nome completo',
          description: 'Como está nos seus documentos',
          actionLabel: 'Escrever',
          href: '/perfil',
        },
    enrollmentId
      ? {
          id: 'enrollment',
          isDone: true,
          title: `Matrícula ${enrollmentId}`,
          description: 'Vem do seu Perfil',
          actionLabel: 'Trocar',
          href: '/perfil',
        }
      : {
          id: 'enrollment',
          isDone: false,
          title: 'Matrícula',
          description: 'Informe uma vez no Perfil',
          actionLabel: 'Perfil',
          href: '/perfil',
        },
    proofCount > 0
      ? {
          id: 'proofs',
          isDone: true,
          title: `${proofCount} ${proofCount === 1 ? 'comprovante separado' : 'comprovantes separados'}`,
          description: 'Por item, prontos para entregar',
          actionLabel: 'Ver',
          href: '/atividades',
        }
      : {
          id: 'proofs',
          isDone: false,
          title: 'Nenhum comprovante conta ainda',
          description: 'Registre uma atividade com comprovante',
          actionLabel: 'Registrar',
          href: '/registrar',
        },
  ]
}

/**
 * Escreve o título da tela conforme quantas coisas faltam.
 *
 * @param checks As linhas de {@link buildChecks}.
 * @returns `"Tudo pronto"`, `"Falta 1 coisa"` ou `"Faltam N coisas"`.
 */
export function formatPendingTitle(checks: FormCheck[]): string {
  const pending = checks.filter((check) => !check.isDone).length

  if (pending === 0) return 'Tudo pronto'
  return pending === 1 ? 'Falta 1 coisa' : `Faltam ${pending} coisas`
}

/**
 * Avisa que o que passa da meta não entra no pedido.
 *
 * @param progress Progresso do aluno.
 * @returns A frase, ou `null` quando a soma dos itens não passa da meta.
 *
 * @example
 * ```ts
 * formatOverflowNote(progress) // "Seus itens somam 124h. O que passa de 120h não entra no pedido."
 * ```
 */
export function formatOverflowNote(progress: Progress): string | null {
  if (progress.itemsSum <= progress.targetHours) return null

  const sum = formatHours(progress.itemsSum, { fractionDigits: 'auto' })
  const target = formatHours(progress.targetHours, { fractionDigits: 0 })

  return `Seus itens somam ${sum}. O que passa de ${target} não entra no pedido.`
}

/** Dados de {@link buildPreviewWarnings}. */
export type PreviewWarningsInput = {
  progress: Progress
  profile: Profile
}

/**
 * Lista o que falta no pedido, em frases para a prévia.
 *
 * @remarks
 * São avisos, não bloqueios: a coordenação pode aceitar um pedido incompleto, e só ela diz. Não soma
 * horas: usa `totalHours`, `targetHours` e `missingHours` do progresso (RNF20). A matrícula não
 * entra, porque o Perfil a trata como opcional.
 *
 * @param input Progresso e perfil do aluno.
 * @returns As frases, na ordem horas e nome. Vazio quando nada falta.
 *
 * @example
 * ```ts
 * buildPreviewWarnings({ progress, profile })
 * // ["Você tem 59h de 120h. A coordenação pode recusar um pedido incompleto. Confirme com ela antes de entregar."]
 * ```
 */
export function buildPreviewWarnings({ progress, profile }: PreviewWarningsInput): string[] {
  const warnings: string[] = []

  if (progress.missingHours > 0) {
    const total = formatHours(progress.totalHours, { fractionDigits: 0 })
    const target = formatHours(progress.targetHours, { fractionDigits: 0 })

    warnings.push(
      `Você tem ${total} de ${target}. A coordenação pode recusar um pedido incompleto. Confirme com ela antes de entregar.`,
    )
  }
  if (!profile.name?.trim()) {
    warnings.push('O nome está em branco no formulário. Escreva o nome no Perfil antes de baixar.')
  }
  return warnings
}

/**
 * Escreve o rodapé da tabela de itens sem hora ("21 itens sem horas ficam com traço").
 *
 * @param rows As linhas de {@link buildFormRows}.
 * @returns A frase, ou `null` quando todos os itens têm hora.
 */
export function formatBlankRowsNote(rows: FormRow[]): string | null {
  const blank = rows.filter((row) => row.hours === null).length

  if (blank === 0) return null
  return `${blank} ${blank === 1 ? 'item sem horas fica' : 'itens sem horas ficam'} com traço`
}
