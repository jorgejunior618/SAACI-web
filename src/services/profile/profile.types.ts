import * as v from 'valibot'

/** Semestre de início: sempre dia 1 de janeiro (`.1`) ou de julho (`.2`). */
export const StartSemesterSchema = v.pipe(v.string(), v.isoDate(), v.regex(/-(01|07)-01$/))

/**
 * Dados do aluno que não são da conta: nome, matrícula, curso e semestre de início.
 *
 * @remarks
 * O e-mail fica em `account`, porque duas cópias divergem. Curso e semestre nascem `null` no cadastro
 * e são obrigatórios antes do painel (RF09, RF11).
 */
export const ProfileSchema = v.object({
  name: v.nullable(v.string()),
  enrollmentId: v.nullable(v.string()),
  startSemester: v.nullable(StartSemesterSchema),
  courseId: v.nullable(v.string()),
})

export type Profile = v.InferOutput<typeof ProfileSchema>

/** Campos que o aluno pode mudar. Só os enviados mudam. `enrollmentId: null` apaga a matrícula. */
export const UpdateProfileSchema = v.partial(
  v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
    enrollmentId: v.nullable(v.string()),
    startSemester: StartSemesterSchema,
    courseId: v.string(),
  }),
)

export type UpdateProfile = v.InferOutput<typeof UpdateProfileSchema>
