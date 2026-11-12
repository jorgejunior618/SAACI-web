import * as v from 'valibot'

const SEMESTER_PATTERN = /^(\d{4})\.([12])$/

/** Converte "2023.2" em "2023-07-01". Só recebe texto que já passou no `SEMESTER_PATTERN`. */
function toIsoDate(text: string): string {
  const [year, term] = text.split('.')

  return `${year}-${term === '1' ? '01' : '07'}-01`
}

/** Hoje como `AAAA-MM-DD` no fuso do aparelho, para a virada do dia valer para quem digita. */
function getToday(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

/** Diz se o semestre começa depois de hoje. Compara texto `AAAA-MM-DD`, que ordena como data. */
function startsInFuture(text: string): boolean {
  return toIsoDate(text) > getToday()
}

/**
 * Campo "Em que semestre você entrou no curso?" do Seu curso.
 *
 * @remarks
 * A pessoa digita `AAAA.1` ou `AAAA.2`. A saída é o dia 1 de janeiro ou de julho, no formato que o
 * `updateProfile` aceita em `startSemester`. Semestre que ainda não começou é recusado, porque
 * ninguém entrou nele.
 */
export const StartSemesterFormSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Digite o ano e o semestre, como 2023.2.'),
  v.regex(SEMESTER_PATTERN, 'Use o ano, um ponto e o número 1 ou 2, como 2023.2.'),
  v.check(
    (text) => !startsInFuture(text),
    'Esse semestre ainda não começou. Digite o semestre em que você entrou.',
  ),
  v.transform(toIsoDate),
)

/** Semestre como a pessoa digita, antes da validação. */
export type StartSemesterInput = v.InferInput<typeof StartSemesterFormSchema>
/** Semestre depois da validação, como data `AAAA-MM-DD` de 1º de janeiro ou de julho. */
export type StartSemesterOutput = v.InferOutput<typeof StartSemesterFormSchema>

/** Campos do formulário de confirmação do curso: só o semestre em que a pessoa entrou. */
export const CourseConfirmSchema = v.object({ startSemester: StartSemesterFormSchema })

/** Valores do formulário de confirmação como a pessoa digita, antes da validação. */
export type CourseConfirmInput = v.InferInput<typeof CourseConfirmSchema>
/** Valores do formulário de confirmação depois da validação, já limpos pelo schema. */
export type CourseConfirmOutput = v.InferOutput<typeof CourseConfirmSchema>
