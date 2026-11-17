import type { Activity } from '@/services/activities'
import type { Profile } from '@/services/profile'
import type { Progress } from '@/services/progress'
import type { RuleItem } from '@/services/rules'
import { formatHours } from '@/utils/format-hours'

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

/** Uma linha da tabela do formulário: um item do curso, com horas ou sem. */
export type FormRow = {
  itemNumber: number
  name: string
  /** Horas que contam no item, já calculadas. `null` quando o item não tem hora (vira traço). */
  hours: number | null
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
 * Lê o `status` que o cálculo único devolveu: não decide o que conta.
 *
 * @param activities Atividades do aluno.
 * @returns Quantos comprovantes entram no pedido.
 */
export function countProofs(activities: Activity[]): number {
  return activities.filter((activity) => activity.status !== 'nao_conta').length
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
 * Monta a tabela do formulário: todos os itens do curso, na ordem do formulário.
 *
 * @remarks
 * As horas de cada item vêm de `progress.categories` (RNF20). Item sem hora fica com `null`, que a
 * tela e o PDF escrevem como traço.
 *
 * @param ruleItems Itens do formulário do curso.
 * @param progress Progresso do aluno, de `getProgress`.
 * @returns Uma linha por item do curso.
 */
export function buildFormRows(ruleItems: RuleItem[], progress: Progress): FormRow[] {
  return ruleItems.map((item) => {
    const hours = progress.categories.find((c) => c.itemNumber === item.itemNumber)?.countedHours

    return {
      itemNumber: item.itemNumber,
      name: item.name,
      hours: hours && hours > 0 ? hours : null,
    }
  })
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

/**
 * Escreve a data e a hora de geração, como o formulário e a tela as mostram.
 *
 * @remarks
 * Usa o relógio do aparelho. Monta o texto à mão para não depender do `Intl` do ambiente.
 *
 * @param date Momento da geração.
 * @returns O texto, por exemplo `"31/10/2026, 15:30"`.
 */
export function formatGeneratedAt(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0')

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const FILE_PREFIX = 'formulario-atividades-complementares'

/**
 * Monta o nome do arquivo do PDF, com o primeiro e o último nome do aluno.
 *
 * @remarks
 * Tira acento e caractere que sistema de arquivo recusa. Sem nome, o arquivo é a versão em branco.
 *
 * @param name Nome completo do aluno, ou `null` na versão em branco.
 * @returns O nome, por exemplo `"formulario-atividades-complementares-ana-moura.pdf"`.
 */
export function buildFileName(name: string | null): string {
  const words = (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  if (words.length === 0) return `${FILE_PREFIX}-em-branco.pdf`

  const slug = words.length === 1 ? words[0] : `${words[0]}-${words.at(-1)}`

  return `${FILE_PREFIX}-${slug}.pdf`
}
