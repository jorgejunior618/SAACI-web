import type { Activity } from '@/services/activities'
import type { Profile } from '@/services/profile'
import type { Progress } from '@/services/progress'
import type { Course, RuleItem } from '@/services/rules'
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
 * Tira acento e caractere que sistema de arquivo recusa. A versão em branco termina em
 * `-em-branco`. Sem nome do aluno, o arquivo preenchido leva só o prefixo, para o nome não dizer
 * que está em branco quando não está.
 *
 * @param name Nome completo do aluno, ou `null` quando ainda não foi escrito.
 * @param isBlank `true` na versão em branco. Padrão: `false`.
 * @returns O nome, por exemplo `"formulario-atividades-complementares-ana-moura.pdf"`.
 */
export function buildFileName(name: string | null, isBlank = false): string {
  if (isBlank) return `${FILE_PREFIX}-em-branco.pdf`

  const words = (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  if (words.length === 0) return `${FILE_PREFIX}.pdf`

  const slug = words.length === 1 ? words[0] : `${words[0]}-${words.at(-1)}`

  return `${FILE_PREFIX}-${slug}.pdf`
}

/**
 * Escreve a linha de cima do formulário, com o campus e a coordenação do curso.
 *
 * @param course Curso do aluno.
 * @returns O texto, por exemplo `"IFCE campus Fortaleza · Coordenação de Engenharia de Computação"`.
 */
export function formatFormHeader(course: Pick<Course, 'campus' | 'name'>): string {
  return `IFCE campus ${course.campus} · Coordenação de ${course.name}`
}

const kilobytes = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/**
 * Escreve o tamanho de um arquivo pequeno em kilobytes ("180 KB").
 *
 * @remarks
 * Usa 1 KB = 1024 bytes. Arquivo com conteúdo nunca aparece como "0 KB".
 *
 * @param bytes Tamanho em bytes.
 * @returns O texto, por exemplo `"180 KB"`.
 */
export function formatKilobytes(bytes: number): string {
  return `${kilobytes.format(bytes > 0 ? Math.max(1, Math.round(bytes / 1024)) : 0)} KB`
}

/** O PDF já gerado e baixado, com o que a tela de baixado mostra e usa para abrir de novo. */
export type DownloadedFile = {
  blob: Blob
  fileName: string
  /** Momento em que o formulário foi gerado, o mesmo da prévia e do rodapé do PDF. */
  generatedAt: Date
}

/** Dados de {@link buildFormPdf}. */
export type FormPdfInput = {
  /** Linha de cima, de {@link formatFormHeader}. */
  header: string
  studentName: string
  enrollmentId: string
  /** Todos os itens do curso, de {@link buildFormRows}. */
  rows: FormRow[]
  /** Total do progresso. Nunca é somado aqui (RNF20). */
  totalHours: number
  /** Data e hora de geração, de {@link formatGeneratedAt}. */
  generatedAt: string
  /** Versão em branco: sem nome, matrícula, horas, total e data. Padrão: `false`. */
  isBlank?: boolean
}

/**
 * Erro de quando o texto do formulário tem um caractere que o PDF não sabe escrever.
 *
 * @remarks
 * A fonte padrão do PDF cobre o alfabeto latino com acentos. Nome com outro alfabeto, ou com símbolo
 * fora dele, cai aqui. A tela diz ao aluno para conferir o nome no Perfil.
 */
export class PdfCharacterError extends Error {
  constructor() {
    super('O texto do formulário tem um caractere que o PDF não aceita.')
    this.name = 'PdfCharacterError'
  }
}

const PDF_TITLE = 'Formulário para Solicitação de Atividades Complementares'

// Medidas em pontos, a unidade do PDF. A4 em pé, margem de 48 e linhas de 20.
const PAGE_SIZE: [number, number] = [595.28, 841.89]
const MARGIN = 48
const ROW_HEIGHT = 20
const ITEM_COLUMN = 44
const HOURS_COLUMN = 96
const FONT_SIZE = 10

// Sem unidade: "40,0", como o formulário em papel.
function formatPlainHours(hours: number): string {
  return formatHours(hours).replace(/h$/, '')
}

/**
 * Monta o PDF do formulário de solicitação de atividades complementares.
 *
 * @remarks
 * Roda no navegador (ADR 0010). O `pdf-lib` entra por `import()` só aqui, no clique, e fica fora do
 * carregamento da tela. A página é A4 com cabeçalho, aluno, matrícula, uma linha por item do curso
 * (horas ou traço), total e a data de geração. A tabela segue em outra página quando não cabe. Não
 * calcula nada: horas e total chegam prontos (RNF20).
 *
 * @param input Dados do formulário.
 * @returns O arquivo, do tipo `application/pdf`.
 * @throws {PdfCharacterError} Algum texto tem caractere fora do alfabeto latino.
 *
 * @example
 * ```ts
 * const pdf = await buildFormPdf({ header, studentName, enrollmentId, rows, totalHours, generatedAt })
 * saveFile(pdf, buildFileName(studentName))
 * ```
 */
export async function buildFormPdf(input: FormPdfInput): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const { header, rows, isBlank = false } = input

  const ink = rgb(0.12, 0.11, 0.09)
  const muted = rgb(0.39, 0.36, 0.32)
  const border = rgb(0.79, 0.76, 0.7)

  try {
    const doc = await PDFDocument.create()

    doc.setTitle(PDF_TITLE)
    doc.setCreator('SAACI')
    doc.setProducer('SAACI')

    const regular = await doc.embedFont(StandardFonts.Helvetica)
    const bold = await doc.embedFont(StandardFonts.HelveticaBold)
    const right = PAGE_SIZE[0] - MARGIN
    const nameX = MARGIN + ITEM_COLUMN
    const hoursX = right - HOURS_COLUMN

    let page = doc.addPage(PAGE_SIZE)
    let y = PAGE_SIZE[1] - MARGIN

    // Corta o texto com reticências quando passa da coluna.
    function fit(text: string, font: typeof regular, maxWidth: number): string {
      if (font.widthOfTextAtSize(text, FONT_SIZE) <= maxWidth) return text

      let cut = text
      while (cut.length > 1 && font.widthOfTextAtSize(`${cut}…`, FONT_SIZE) > maxWidth) {
        cut = cut.slice(0, -1)
      }
      return `${cut.trimEnd()}…`
    }

    // Uma linha da tabela: três células com borda, o número e as horas alinhados à direita.
    function drawRow(cells: [string, string, string], font: typeof regular): void {
      const columns = [
        { x: MARGIN, width: ITEM_COLUMN },
        { x: nameX, width: hoursX - nameX },
        { x: hoursX, width: HOURS_COLUMN },
      ]

      columns.forEach((column, index) => {
        const text = fit(cells[index] ?? '', font, column.width - 12)
        const textWidth = font.widthOfTextAtSize(text, FONT_SIZE)
        const textX = index === 1 ? column.x + 6 : column.x + column.width - 6 - textWidth

        page.drawRectangle({
          x: column.x,
          y: y - ROW_HEIGHT,
          width: column.width,
          height: ROW_HEIGHT,
          borderColor: border,
          borderWidth: 0.5,
        })
        page.drawText(text, { x: textX, y: y - 14, size: FONT_SIZE, font, color: ink })
      })
      y -= ROW_HEIGHT
    }

    function drawTableHead(): void {
      drawRow(['Item', 'Atividade', 'CH Solicitada'], bold)
    }

    // Abre outra página se a próxima linha, mais a margem, não cabe nesta.
    function ensureRoom(height: number): void {
      if (y - height >= MARGIN) return
      page = doc.addPage(PAGE_SIZE)
      y = PAGE_SIZE[1] - MARGIN
      drawTableHead()
    }

    page.drawText(header, { x: MARGIN, y, size: 9, font: regular, color: muted })
    y -= 22
    page.drawText(PDF_TITLE, { x: MARGIN, y, size: 14, font: bold, color: ink })
    y -= 30

    const fields: [string, string][] = [
      ['Aluno', isBlank ? '' : input.studentName],
      ['Matrícula', isBlank ? '' : input.enrollmentId],
    ]

    for (const [label, value] of fields) {
      page.drawText(label, { x: MARGIN, y, size: 11, font: regular, color: muted })
      page.drawText(value, { x: MARGIN + 70, y, size: 11, font: bold, color: ink })
      page.drawLine({
        start: { x: MARGIN + 66, y: y - 3 },
        end: { x: right, y: y - 3 },
        thickness: 0.5,
        color: border,
      })
      y -= 22
    }
    y -= 8

    drawTableHead()
    for (const row of rows) {
      ensureRoom(ROW_HEIGHT)
      const hours = isBlank ? '' : row.hours === null ? '–' : formatPlainHours(row.hours)

      drawRow([String(row.itemNumber), row.name, hours], regular)
    }
    ensureRoom(ROW_HEIGHT)
    drawRow(
      [
        '',
        'Total',
        isBlank ? '' : formatHours(input.totalHours, { fractionDigits: 0 }).replace(/h$/, ''),
      ],
      bold,
    )

    if (!isBlank) {
      ensureRoom(28)
      page.drawText(`Gerado pelo SAACI em ${input.generatedAt}`, {
        x: MARGIN,
        y: y - 18,
        size: 8,
        font: regular,
        color: muted,
      })
    }

    return new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' })
  } catch (error) {
    // O `pdf-lib` escreve `WinAnsi cannot encode "…"` para o caractere que a fonte não tem.
    if (error instanceof Error && error.message.includes('cannot encode')) {
      throw new PdfCharacterError()
    }
    throw error
  }
}
